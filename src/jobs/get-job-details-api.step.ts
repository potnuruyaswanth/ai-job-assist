import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { db } from '../utils/db';
import { analyzeJobMatch } from '../utils/gemini';

interface Session {
  userId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

interface UserProfile {
  userId: string;
  skills: string[];
  experienceYears: number;
  preferredRoles: string[];
}

export const config: ApiRouteConfig = {
  name: 'GetJobDetailsAPI',
  type: 'api',
  path: '/jobs/:jobId',
  method: 'GET',
  description: 'Get detailed job information with AI match analysis',
  emits: [],
  flows: ['job-discovery-flow'],
  responseSchema: {
    200: z.object({
      job: z.object({
        id: z.string(),
        title: z.string(),
        company: z.string(),
        location: z.string(),
        remote: z.boolean(),
        salary: z.string().optional(),
        description: z.string(),
        requirements: z.array(z.string()),
        benefits: z.array(z.string()),
        applyUrl: z.string(),
        postedAt: z.string()
      }),
      matchAnalysis: z.object({
        score: z.number(),
        matchingSkills: z.array(z.string()),
        missingSkills: z.array(z.string()),
        recommendation: z.string()
      })
    }),
    404: z.object({
      error: z.string()
    })
  }
};

export const handler: Handlers['GetJobDetailsAPI'] = async (req, { logger }) => {
  const { jobId } = req.pathParams;
  
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return {
      status: 404,
      body: { error: 'Authorization required' }
    };
  }
  
  const token = authHeader.replace('Bearer ', '');
  const session = db.get<Session>('sessions', token);
  if (!session) {
    return {
      status: 404,
      body: { error: 'Invalid session' }
    };
  }
  
  logger.info('Fetching job details', { jobId, userId: session.userId });
  
  // Get user profile for matching
  const profile = db.get<UserProfile>('user_profiles', session.userId);
  const userSkills = profile?.skills || [];
  
  // In production, fetch from database
  // Mock job data for demo
  const job = {
    id: jobId,
    title: 'Senior Software Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    remote: true,
    salary: '$150k - $200k',
    description: `We're looking for a Senior Software Engineer to join our growing team. You'll be working on cutting-edge projects that impact millions of users.

As a Senior Engineer, you'll:
- Design and implement scalable backend services
- Mentor junior engineers
- Collaborate with product and design teams
- Contribute to architectural decisions`,
    requirements: [
      '5+ years of software development experience',
      'Strong proficiency in Python and JavaScript',
      'Experience with React and Node.js',
      'Familiarity with AWS or similar cloud platforms',
      'Strong communication skills',
      'Experience with PostgreSQL or similar databases'
    ],
    benefits: [
      'Competitive salary and equity',
      'Health, dental, and vision insurance',
      'Unlimited PTO',
      'Remote-friendly culture',
      '401(k) matching',
      'Professional development budget'
    ],
    applyUrl: `https://careers.techcorp.com/apply/${jobId}`,
    postedAt: new Date(Date.now() - 3 * 86400000).toISOString()
  };
  
  // AI Match Analysis using Gemini
  logger.info('Analyzing job match with Gemini AI', { jobId, userSkillsCount: userSkills.length });
  
  const jobRequiredSkills = ['Python', 'JavaScript', 'React', 'Node.js', 'AWS', 'PostgreSQL'];
  const matchingSkills = userSkills.filter((s: string) => 
    jobRequiredSkills.some(js => js.toLowerCase() === s.toLowerCase())
  );
  const missingSkills = jobRequiredSkills.filter(js => 
    !userSkills.some((s: string) => s.toLowerCase() === js.toLowerCase())
  );
  
  // Use Gemini AI for deeper analysis
  const aiAnalysis = await analyzeJobMatch(
    job.description,
    userSkills,
    profile?.experienceYears || 0
  );
  
  const matchScore = aiAnalysis.score;
  
  let recommendation: string;
  if (aiAnalysis.reasons.length > 0) {
    recommendation = aiAnalysis.reasons.join(' ');
  } else if (matchScore >= 80) {
    recommendation = "Excellent match! Your skills align very well with this position. We recommend applying.";
  } else if (matchScore >= 60) {
    recommendation = "Good match! You have most of the required skills. Consider highlighting relevant projects in your application.";
  } else if (matchScore >= 40) {
    recommendation = "Moderate match. Focus on transferable skills and consider upskilling in the missing areas.";
  } else {
    recommendation = "This role may require skills outside your current profile. Consider it as a stretch opportunity.";
  }
  
  logger.info('AI analysis complete', { matchScore, reasonsCount: aiAnalysis.reasons.length });
  
  return {
    status: 200,
    body: {
      job,
      matchAnalysis: {
        score: matchScore,
        matchingSkills,
        missingSkills,
        recommendation
      }
    }
  };
};
