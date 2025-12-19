import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { db } from '../utils/db';

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
  education?: string[];
  resumeId?: string;
}

interface JobMatch {
  jobId: string;
  jobTitle: string;
  company: string;
  overallScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendation: string;
}

interface JobMatchData {
  matches: JobMatch[];
}

export const config: ApiRouteConfig = {
  name: 'GetJobMatchesAPI',
  type: 'api',
  path: '/jobs/matches',
  method: 'GET',
  description: 'Get AI-powered job matches for user profile',
  emits: [],
  flows: ['job-discovery-flow'],
  responseSchema: {
    200: z.object({
      matches: z.array(z.object({
        jobId: z.string(),
        jobTitle: z.string(),
        company: z.string(),
        overallScore: z.number(),
        matchingSkills: z.array(z.string()),
        missingSkills: z.array(z.string()),
        recommendation: z.string()
      })),
      profileStrength: z.number(),
      suggestions: z.array(z.string())
    }),
    401: z.object({
      error: z.string()
    })
  }
};

export const handler: Handlers['GetJobMatchesAPI'] = async (req, { logger }) => {
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
  
  const { minScore = '70', limit = '20' } = req.queryParams;
  const minScoreNum = parseInt(minScore);
  const limitNum = parseInt(limit);
  
  logger.info('Fetching job matches', { userId: session.userId, minScore: minScoreNum });
  
  // Get user profile
  const profile = db.get<UserProfile>('user_profiles', session.userId);
  
  // Get cached matches
  const matchData = db.get<JobMatchData>('job_matches', session.userId);
  const allMatches = matchData?.matches || [];
  
  // Filter by minimum score
  const filteredMatches = allMatches
    .filter((m) => m.overallScore >= minScoreNum)
    .slice(0, limitNum);
  
  // Calculate profile strength
  const profileStrength = calculateProfileStrength(profile);
  
  // Generate suggestions
  const suggestions = generateSuggestions(profile, allMatches);
  
  return {
    status: 200,
    body: {
      matches: filteredMatches,
      profileStrength,
      suggestions
    }
  };
};

function calculateProfileStrength(profile: UserProfile | null): number {
  if (!profile) return 0;
  
  let strength = 0;
  
  // Skills (40%)
  const skillsCount = profile.skills?.length || 0;
  strength += Math.min(skillsCount * 4, 40);
  
  // Experience (30%)
  const expYears = profile.experienceYears || 0;
  strength += Math.min(expYears * 5, 30);
  
  // Education (15%)
  const eduCount = profile.education?.length || 0;
  strength += Math.min(eduCount * 7.5, 15);
  
  // Resume uploaded (15%)
  if (profile.resumeId) {
    strength += 15;
  }
  
  return Math.round(strength);
}

function generateSuggestions(profile: UserProfile | null, matches: JobMatch[]): string[] {
  const suggestions: string[] = [];
  
  if (!profile?.resumeId) {
    suggestions.push("Upload your resume to improve job matching accuracy");
  }
  
  if ((profile?.skills?.length || 0) < 5) {
    suggestions.push("Add more skills to your profile for better matches");
  }
  
  if (!profile?.experienceYears) {
    suggestions.push("Add your years of experience to improve matching");
  }
  
  // Analyze missing skills from matches
  const missingSkillsCount: Record<string, number> = {};
  for (const match of matches.slice(0, 10)) {
    for (const skill of match.missingSkills || []) {
      missingSkillsCount[skill] = (missingSkillsCount[skill] || 0) + 1;
    }
  }
  
  const topMissingSkills = Object.entries(missingSkillsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([skill]) => skill);
  
  if (topMissingSkills.length > 0) {
    suggestions.push(`Consider learning: ${topMissingSkills.join(', ')}`);
  }
  
  return suggestions;
}
