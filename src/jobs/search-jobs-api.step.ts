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
  name: 'SearchJobsAPI',
  type: 'api',
  path: '/jobs/search',
  method: 'GET',
  description: 'Search for jobs with filters',
  emits: [],
  flows: ['job-discovery-flow'],
  responseSchema: {
    200: z.object({
      jobs: z.array(z.object({
        id: z.string(),
        title: z.string(),
        company: z.string(),
        location: z.string(),
        remote: z.boolean(),
        salary: z.string().optional(),
        description: z.string(),
        applyUrl: z.string(),
        postedAt: z.string(),
        matchScore: z.number().optional()
      })),
      total: z.number(),
      page: z.number(),
      totalPages: z.number()
    }),
    401: z.object({
      error: z.string()
    })
  }
};

export const handler: Handlers['SearchJobsAPI'] = async (req, { logger }) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return {
      status: 401,
      body: { error: 'Authorization required' }
    };
  }
  
  const token = authHeader.replace('Bearer ', '');
  const session = db.get<Session>('sessions', token);
  if (!session) {
    return {
      status: 401,
      body: { error: 'Invalid session' }
    };
  }
  
  const { query, location, remote, minSalary, maxSalary, page = '1', limit = '20' } = req.queryParams;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  logger.info('Searching jobs', { query, location, remote, userId: session.userId });
  
  // Get user profile for matching
  const profile = db.get<UserProfile>('user_profiles', session.userId);
  
  // In production, this would query a database or external job APIs
  // For demo, return mock jobs with AI-powered scoring
  const mockJobs = await generateMockJobs(query, location, remote === 'true', profile);
  
  // Paginate results
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedJobs = mockJobs.slice(startIndex, startIndex + limitNum);
  
  return {
    status: 200,
    body: {
      jobs: paginatedJobs,
      total: mockJobs.length,
      page: pageNum,
      totalPages: Math.ceil(mockJobs.length / limitNum)
    }
  };
};

// AI-powered job generator with Gemini scoring
async function generateMockJobs(query?: string, location?: string, remote?: boolean, profile?: UserProfile | null) {
  const companies = ['TechCorp', 'StartupAI', 'CloudSolutions', 'DataDriven Inc', 'InnovateTech', 'FutureLabs'];
  const titles = [
    'Senior Software Engineer', 'Full Stack Developer', 'Backend Engineer',
    'Frontend Developer', 'DevOps Engineer', 'Data Scientist',
    'Machine Learning Engineer', 'Product Manager', 'Engineering Manager'
  ];
  const locations = ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Remote'];
  
  const userSkills = profile?.skills || [];
  const userExperience = profile?.experienceYears || 0;
  
  const jobs = await Promise.all(titles.slice(0, 6).map(async (title, index) => {
    const jobSkills = ['Python', 'JavaScript', 'React', 'Node.js', 'AWS', 'PostgreSQL'];
    const description = `We're looking for a ${title} to join our team. You'll work on exciting projects using modern technologies. Requirements include experience with ${jobSkills.slice(0, 3).join(', ')}.`;
    
    // Use Gemini AI for match scoring
    let matchScore = 70 + Math.floor(Math.random() * 20);
    if (userSkills.length > 0) {
      try {
        const analysis = await analyzeJobMatch(description, userSkills, userExperience);
        matchScore = analysis.score;
      } catch (error) {
        // Fallback to basic scoring if AI fails
        const matchingSkills = userSkills.filter((s: string) => 
          jobSkills.some(js => js.toLowerCase() === s.toLowerCase())
        );
        matchScore = Math.round((matchingSkills.length / Math.max(userSkills.length, 1)) * 100);
      }
    }
    
    return {
      id: `job_${Date.now()}_${index}`,
      title: query ? `${title} - ${query}` : title,
      company: companies[index % companies.length],
      location: location || locations[index % locations.length],
      remote: remote ?? index % 2 === 0,
      salary: `$${100 + index * 20}k - $${150 + index * 20}k`,
      description,
      applyUrl: `https://careers.example.com/job/${index}`,
      postedAt: new Date(Date.now() - index * 86400000).toISOString(),
      matchScore
    };
  }));
  
  return jobs.filter(job => !profile || job.matchScore >= 50);
}
