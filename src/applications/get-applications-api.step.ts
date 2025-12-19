import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { db } from '../utils/db';

interface Session {
  userId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

interface ApplicationIndex {
  userId: string;
  applicationIds: string[];
}

interface Application {
  id: string;
  jobId: string;
  jobTitle?: string;
  company?: string;
  status: string;
  appliedAt?: string;
  interviewDate?: string;
  notes?: string;
  createdAt: string;
}

export const config: ApiRouteConfig = {
  name: 'GetApplicationsAPI',
  type: 'api',
  path: '/applications',
  method: 'GET',
  description: 'Get user job applications with status tracking',
  emits: [],
  flows: ['job-application-flow'],
  responseSchema: {
    200: z.object({
      applications: z.array(z.object({
        id: z.string(),
        jobId: z.string(),
        jobTitle: z.string(),
        company: z.string(),
        status: z.string(),
        appliedAt: z.string().optional(),
        interviewDate: z.string().optional(),
        notes: z.string().optional(),
        createdAt: z.string()
      })),
      stats: z.object({
        total: z.number(),
        applied: z.number(),
        interview: z.number(),
        offer: z.number(),
        rejected: z.number()
      })
    }),
    401: z.object({
      error: z.string()
    })
  }
};

export const handler: Handlers['GetApplicationsAPI'] = async (req, { logger }) => {
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
  
  const { status: filterStatus } = req.queryParams;
  
  logger.info('Fetching applications', { userId: session.userId, filterStatus });
  
  // Get user's application tracking data
  const userApplications = db.get<ApplicationIndex>('user_applications_index', session.userId);
  const applicationIds = userApplications?.applicationIds || [];
  
  // Fetch all applications
  const applications: Array<{
    id: string;
    jobId: string;
    jobTitle: string;
    company: string;
    status: string;
    appliedAt?: string;
    interviewDate?: string;
    notes?: string;
    createdAt: string;
  }> = [];
  
  for (const appId of applicationIds) {
    const app = db.get<Application>('applications', appId);
    if (app && (!filterStatus || app.status === filterStatus)) {
      applications.push({
        id: app.id,
        jobId: app.jobId,
        jobTitle: app.jobTitle || 'Unknown Position',
        company: app.company || 'Unknown Company',
        status: app.status,
        appliedAt: app.appliedAt,
        interviewDate: app.interviewDate,
        notes: app.notes,
        createdAt: app.createdAt
      });
    }
  }
  
  // Sort by creation date (newest first)
  applications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Calculate stats
  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    interview: applications.filter(a => a.status === 'interview').length,
    offer: applications.filter(a => a.status === 'offer').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };
  
  return {
    status: 200,
    body: {
      applications,
      stats
    }
  };
};
