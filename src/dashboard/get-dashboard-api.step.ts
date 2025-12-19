import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { db } from '../utils/db';

interface Session {
  userId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

interface UserProfile {
  userId: string;
  skills: string[];
  experienceYears: number;
  preferredRoles: string[];
  resumeId?: string;
}

interface ApplicationIndex {
  userId: string;
  applicationIds: string[];
  stats: {
    total: number;
    applied: number;
    interview: number;
    offer: number;
    rejected: number;
  };
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: string;
  appliedAt?: string;
  createdAt: string;
}

interface JobMatch {
  jobTitle: string;
  company: string;
  overallScore: number;
}

interface JobMatches {
  matches: JobMatch[];
}

export const config: ApiRouteConfig = {
  name: 'GetDashboardAPI',
  type: 'api',
  path: '/dashboard',
  method: 'GET',
  description: 'Get user dashboard with overview statistics',
  emits: [],
  flows: ['dashboard-flow'],
  responseSchema: {
    200: z.object({
      user: z.object({
        name: z.string(),
        email: z.string(),
        profileComplete: z.boolean()
      }),
      applications: z.object({
        total: z.number(),
        applied: z.number(),
        interview: z.number(),
        offer: z.number(),
        rejected: z.number(),
        recentApplications: z.array(z.object({
          id: z.string(),
          jobTitle: z.string(),
          company: z.string(),
          status: z.string(),
          appliedAt: z.string().optional()
        }))
      }),
      socialMedia: z.object({
        connectedPlatforms: z.array(z.string()),
        scheduledPosts: z.number(),
        publishedThisWeek: z.number()
      }),
      jobMatches: z.object({
        newMatches: z.number(),
        topMatch: z.object({
          jobTitle: z.string(),
          company: z.string(),
          score: z.number()
        }).optional()
      })
    }),
    401: z.object({
      error: z.string()
    })
  }
};

export const handler: Handlers['GetDashboardAPI'] = async (req, { logger }) => {
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
  
  logger.info('Fetching dashboard data', { userId: session.userId });
  
  // Get user info
  const user = db.get<User>('users', session.email);
  const profile = db.get<UserProfile>('user_profiles', session.userId);
  
  // Get application stats
  const appIndex = db.get<ApplicationIndex>('user_applications_index', session.userId);
  const applicationStats = appIndex?.stats || {
    total: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0
  };
  
  // Get recent applications
  const recentApplications: Array<{id: string; jobTitle: string; company: string; status: string; appliedAt?: string}> = [];
  const appIds = (appIndex?.applicationIds || []).slice(-5).reverse();
  for (const appId of appIds) {
    const app = db.get<Application>('applications', appId);
    if (app) {
      recentApplications.push({
        id: app.id,
        jobTitle: app.jobTitle || 'Unknown Position',
        company: app.company || 'Unknown',
        status: app.status,
        appliedAt: app.appliedAt
      });
    }
  }
  
  // Social media stats (empty since we removed social features)
  const socialStats = {
    connectedPlatforms: [] as string[],
    scheduledPosts: 0,
    publishedThisWeek: 0
  };
  
  // Get job matches
  const matches = db.get<JobMatches>('job_matches', session.userId);
  const topMatches = matches?.matches || [];
  
  const profileComplete = !!(
    profile?.skills?.length && profile.skills.length > 0 &&
    profile?.experienceYears && profile.experienceYears > 0 &&
    profile?.resumeId
  );
  
  return {
    status: 200,
    body: {
      user: {
        name: user?.name || 'User',
        email: user?.email || session.email,
        profileComplete
      },
      applications: {
        ...applicationStats,
        recentApplications
      },
      socialMedia: socialStats,
      jobMatches: {
        newMatches: topMatches.filter((m) => m.overallScore >= 70).length,
        topMatch: topMatches[0] ? {
          jobTitle: topMatches[0].jobTitle,
          company: topMatches[0].company,
          score: topMatches[0].overallScore
        } : undefined
      }
    }
  };
};
