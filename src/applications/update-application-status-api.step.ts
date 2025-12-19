import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { db } from '../utils/db';

interface Session {
  userId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

interface Application {
  id: string;
  userId: string;
  jobId: string;
  status: string;
  notes?: string;
  interviewDate?: string;
  appliedAt?: string;
  updatedAt: string;
  statusHistory?: Array<{ status: string; changedAt: string; notes?: string }>;
}

export const config: ApiRouteConfig = {
  name: 'UpdateApplicationStatusAPI',
  type: 'api',
  path: '/applications/:applicationId/status',
  method: 'PUT',
  description: 'Update job application status',
  emits: [],
  flows: ['job-application-flow'],
  bodySchema: z.object({
    status: z.enum(['draft', 'applied', 'interview', 'offer', 'rejected', 'withdrawn']),
    notes: z.string().optional(),
    interviewDate: z.string().optional()
  }),
  responseSchema: {
    200: z.object({
      message: z.string(),
      application: z.object({
        id: z.string(),
        status: z.string(),
        updatedAt: z.string()
      })
    }),
    404: z.object({
      error: z.string()
    })
  }
};

export const handler: Handlers['UpdateApplicationStatusAPI'] = async (req, { logger }) => {
  const { applicationId } = req.pathParams;
  const { status, notes, interviewDate } = req.body;
  
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
  
  // Get existing application
  const application = db.get<Application>('applications', applicationId);
  if (!application || application.userId !== session.userId) {
    return {
      status: 404,
      body: { error: 'Application not found' }
    };
  }
  
  const timestamp = new Date().toISOString();
  
  logger.info('Updating application status', { 
    applicationId, 
    oldStatus: application.status, 
    newStatus: status 
  });
  
  // Update application
  const updatedApplication: Application = {
    ...application,
    status,
    notes: notes || application.notes,
    interviewDate: interviewDate || application.interviewDate,
    appliedAt: status === 'applied' && !application.appliedAt ? timestamp : application.appliedAt,
    updatedAt: timestamp,
    statusHistory: [
      ...(application.statusHistory || []),
      { status, changedAt: timestamp, notes }
    ]
  };
  
  db.set<Application>('applications', applicationId, updatedApplication);
  
  return {
    status: 200,
    body: {
      message: 'Application status updated',
      application: {
        id: applicationId,
        status,
        updatedAt: timestamp
      }
    }
  };
};
