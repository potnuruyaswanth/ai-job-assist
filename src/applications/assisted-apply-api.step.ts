import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { db } from '../utils/db';
import { generateCoverLetter as generateAICoverLetter } from '../utils/gemini';

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
}

interface UserProfile {
  userId: string;
  skills: string[];
  experienceYears: number;
  preferredRoles: string[];
  phone?: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  applyUrl: string;
}

interface Application {
  id: string;
  userId: string;
  jobId: string;
  jobTitle?: string;
  company?: string;
  status: string;
  coverLetter?: string;
  prefillData: any;
  customMessage?: string;
  createdAt: string;
  updatedAt: string;
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

export const config: ApiRouteConfig = {
  name: 'AssistedApplyAPI',
  type: 'api',
  path: '/jobs/:jobId/apply',
  method: 'POST',
  description: 'Start assisted job application process',
  emits: [],
  flows: ['job-application-flow'],
  bodySchema: z.object({
    generateCoverLetter: z.boolean().default(true),
    customMessage: z.string().optional()
  }),
  responseSchema: {
    200: z.object({
      applicationId: z.string(),
      status: z.string(),
      applyUrl: z.string(),
      coverLetter: z.string().optional(),
      prefillData: z.object({
        name: z.string(),
        email: z.string(),
        phone: z.string().optional(),
        skills: z.array(z.string()),
        experience: z.string()
      }).optional()
    }),
    400: z.object({
      error: z.string()
    })
  }
};

export const handler: Handlers['AssistedApplyAPI'] = async (req, { logger }) => {
  const { jobId } = req.pathParams;
  const { generateCoverLetter, customMessage } = req.body;
  
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return {
      status: 400,
      body: { error: 'Authorization required' }
    };
  }
  
  const token = authHeader.replace('Bearer ', '');
  const session = db.get<Session>('sessions', token);
  if (!session) {
    return {
      status: 400,
      body: { error: 'Invalid session' }
    };
  }
  
  logger.info('Starting assisted apply', { jobId, userId: session.userId });
  
  // Get job details
  const job = db.get<Job>('jobs', jobId);
  // Get user profile
  const profile = db.get<UserProfile>('user_profiles', session.userId);
  const user = db.get<User>('users', session.email);
  
  const applicationId = `app_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const timestamp = new Date().toISOString();
  
  // Generate cover letter if requested using Gemini AI
  let coverLetter = '';
  if (generateCoverLetter) {
    logger.info('Generating AI cover letter with Gemini', { jobId });
    coverLetter = await generateAICoverLetter(
      job?.title || 'Position',
      job?.company || 'Company',
      `Job at ${job?.company || 'Company'} for ${job?.title || 'Position'}`,
      {
        name: user?.name || 'Applicant',
        skills: profile?.skills || [],
        experienceYears: profile?.experienceYears || 0,
        preferredRoles: profile?.preferredRoles || []
      },
      customMessage
    );
    logger.info('Cover letter generated successfully');
  }
  
  // Prepare prefill data for application form
  const prefillData = {
    name: user?.name || '',
    email: user?.email || session.email,
    phone: profile?.phone || '',
    skills: profile?.skills || [],
    experience: `${profile?.experienceYears || 0} years of experience in ${(profile?.preferredRoles || ['software development']).join(', ')}`
  };
  
  // Store application
  db.set<Application>('applications', applicationId, {
    id: applicationId,
    userId: session.userId,
    jobId,
    jobTitle: job?.title,
    company: job?.company,
    status: 'draft',
    coverLetter,
    prefillData,
    customMessage,
    createdAt: timestamp,
    updatedAt: timestamp
  });
  
  // Update user applications index
  const appIndex = db.get<ApplicationIndex>('user_applications_index', session.userId) || {
    userId: session.userId,
    applicationIds: [],
    stats: { total: 0, applied: 0, interview: 0, offer: 0, rejected: 0 }
  };
  appIndex.applicationIds.push(applicationId);
  appIndex.stats.total++;
  db.set<ApplicationIndex>('user_applications_index', session.userId, appIndex);
  
  return {
    status: 200,
    body: {
      applicationId,
      status: 'ready',
      applyUrl: job?.applyUrl || `https://apply.example.com/job/${jobId}`,
      coverLetter: generateCoverLetter ? coverLetter : undefined,
      prefillData
    }
  };
};
