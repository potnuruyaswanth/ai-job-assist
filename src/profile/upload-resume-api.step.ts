import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { db } from '../utils/db';

interface Session {
  userId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
}

export const config: ApiRouteConfig = {
  name: 'UploadResumeAPI',
  type: 'api',
  path: '/profile/resume/upload',
  method: 'POST',
  description: 'Upload and parse resume for profile creation',
  emits: [],
  flows: ['profile-flow'],
  bodySchema: z.object({
    fileName: z.string(),
    fileType: z.enum(['pdf', 'docx']),
    fileContent: z.string(), // Base64 encoded
    fileSize: z.number()
  }),
  responseSchema: {
    200: z.object({
      message: z.string(),
      resumeId: z.string(),
      status: z.string()
    }),
    400: z.object({
      error: z.string()
    })
  }
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const handler: Handlers['UploadResumeAPI'] = async (req, { logger }) => {
  const { fileName, fileType, fileContent, fileSize } = req.body;
  
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
  
  if (fileSize > MAX_FILE_SIZE) {
    return {
      status: 400,
      body: { error: 'File size exceeds 5MB limit' }
    };
  }
  
  const resumeId = `resume_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const timestamp = new Date().toISOString();
  
  logger.info('Resume upload started', { resumeId, fileName, fileType, userId: session.userId });
  
  // In production, upload to S3/Cloudinary
  const mockUrl = `https://storage.example.com/resumes/${resumeId}/${fileName}`;
  
  // Store resume metadata
  db.set<Resume>('resumes', resumeId, {
    id: resumeId,
    userId: session.userId,
    fileName,
    fileType,
    fileUrl: mockUrl,
    status: 'uploaded',
    uploadedAt: timestamp
  });
  
  // Update user profile with resume ID
  const profile = db.get<any>('user_profiles', session.userId) || { userId: session.userId };
  profile.resumeId = resumeId;
  db.set('user_profiles', session.userId, profile);
  
  return {
    status: 200,
    body: {
      message: 'Resume uploaded successfully.',
      resumeId,
      status: 'uploaded'
    }
  };
};
