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
  profile?: any;
}

interface UserProfile {
  userId: string;
  skills: string[];
  experienceYears: number;
  preferredRoles: string[];
  education: string[];
  resumeId?: string;
}

export const config: ApiRouteConfig = {
  name: 'GetProfileAPI',
  type: 'api',
  path: '/profile',
  method: 'GET',
  description: 'Get user profile with parsed resume data',
  emits: [],
  flows: ['profile-flow'],
  responseSchema: {
    200: z.object({
      profile: z.object({
        userId: z.string(),
        name: z.string().optional(),
        email: z.string().optional(),
        skills: z.array(z.string()),
        experienceYears: z.number(),
        preferredRoles: z.array(z.string()),
        education: z.array(z.string()),
        resumeId: z.string().optional()
      })
    }),
    401: z.object({
      error: z.string()
    })
  }
};

export const handler: Handlers['GetProfileAPI'] = async (req, { logger }) => {
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
  
  logger.info('Fetching user profile', { userId: session.userId });
  
  const profile = db.get<UserProfile>('user_profiles', session.userId);
  const user = db.get<User>('users', session.email);
  
  return {
    status: 200,
    body: {
      profile: {
        userId: session.userId,
        name: user?.name,
        email: user?.email,
        skills: profile?.skills || [],
        experienceYears: profile?.experienceYears || 0,
        preferredRoles: profile?.preferredRoles || [],
        education: profile?.education || [],
        resumeId: profile?.resumeId
      }
    }
  };
};
