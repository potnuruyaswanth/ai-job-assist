import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { db } from '../utils/db';

interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  profile?: any;
}

interface Session {
  userId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

export const config: ApiRouteConfig = {
  name: 'LoginAPI',
  type: 'api',
  path: '/auth/login',
  method: 'POST',
  description: 'User login endpoint',
  emits: [],
  flows: ['auth-flow'],
  bodySchema: z.object({
    email: z.string().email(),
    password: z.string()
  }),
  responseSchema: {
    200: z.object({
      message: z.string(),
      token: z.string(),
      user: z.object({
        id: z.string(),
        email: z.string(),
        name: z.string()
      })
    }),
    401: z.object({
      error: z.string()
    })
  }
};

export const handler: Handlers['LoginAPI'] = async (req, { logger }) => {
  const { email, password } = req.body;
  
  logger.info('User login attempt', { email });
  
  // Get user from file-based db
  const user = db.get<User>('users', email);
  if (!user) {
    return {
      status: 401,
      body: { error: 'Invalid credentials' }
    };
  }
  
  // Verify password (simplified - use bcrypt in production)
  const passwordHash = Buffer.from(password).toString('base64');
  if (user.passwordHash !== passwordHash) {
    return {
      status: 401,
      body: { error: 'Invalid credentials' }
    };
  }
  
  // Generate JWT token (simplified - use proper JWT in production)
  const token = `jwt_${user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const timestamp = new Date().toISOString();
  
  // Store session
  db.set<Session>('sessions', token, {
    userId: user.id,
    email: user.email,
    createdAt: timestamp,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });
  
  logger.info('User logged in successfully', { userId: user.id });
  
  return {
    status: 200,
    body: {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }
  };
};
