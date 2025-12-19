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
  updatedAt: string;
}

interface UserSettings {
  userId: string;
  preferredJobLocations: string[];
  remoteOnly: boolean;
  salaryRange: { min: number; max: number };
  updatedAt: string;
}

export const config: ApiRouteConfig = {
  name: 'UpdateProfileAPI',
  type: 'api',
  path: '/profile',
  method: 'PUT',
  description: 'Update user profile settings',
  emits: [],
  flows: ['profile-flow'],
  bodySchema: z.object({
    skills: z.array(z.string()).optional(),
    experienceYears: z.number().optional(),
    preferredRoles: z.array(z.string()).optional(),
    preferredLocations: z.array(z.string()).optional(),
    remoteOnly: z.boolean().optional(),
    salaryRange: z.object({
      min: z.number(),
      max: z.number()
    }).optional()
  }),
  responseSchema: {
    200: z.object({
      message: z.string(),
      profile: z.object({
        userId: z.string(),
        skills: z.array(z.string()),
        experienceYears: z.number(),
        preferredRoles: z.array(z.string())
      })
    }),
    401: z.object({
      error: z.string()
    })
  }
};

export const handler: Handlers['UpdateProfileAPI'] = async (req, { logger }) => {
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
  
  const { skills, experienceYears, preferredRoles, preferredLocations, remoteOnly, salaryRange } = req.body;
  const timestamp = new Date().toISOString();
  
  logger.info('Updating user profile', { userId: session.userId });
  
  // Get existing profile
  const existingProfile = db.get<UserProfile>('user_profiles', session.userId) || {} as UserProfile;
  const existingSettings = db.get<UserSettings>('user_settings', session.userId) || {} as UserSettings;
  
  // Update profile
  const updatedProfile: UserProfile = {
    ...existingProfile,
    userId: session.userId,
    skills: skills || existingProfile.skills || [],
    experienceYears: experienceYears ?? existingProfile.experienceYears ?? 0,
    preferredRoles: preferredRoles || existingProfile.preferredRoles || [],
    updatedAt: timestamp
  };
  
  db.set<UserProfile>('user_profiles', session.userId, updatedProfile);
  
  // Update settings
  const updatedSettings: UserSettings = {
    ...existingSettings,
    userId: session.userId,
    preferredJobLocations: preferredLocations || existingSettings.preferredJobLocations || [],
    remoteOnly: remoteOnly ?? existingSettings.remoteOnly ?? false,
    salaryRange: salaryRange || existingSettings.salaryRange || { min: 0, max: 0 },
    updatedAt: timestamp
  };
  
  db.set<UserSettings>('user_settings', session.userId, updatedSettings);
  
  return {
    status: 200,
    body: {
      message: 'Profile updated successfully',
      profile: {
        userId: session.userId,
        skills: updatedProfile.skills,
        experienceYears: updatedProfile.experienceYears,
        preferredRoles: updatedProfile.preferredRoles
      }
    }
  };
};
