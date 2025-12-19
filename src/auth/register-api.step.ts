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
  name: 'RegisterAPI',
  type: 'api',
  path: '/auth/register',
  method: 'POST',
  description: 'User registration endpoint',
  emits: [],
  flows: ['auth-flow'],
  bodySchema: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2)
  }),
  responseSchema: {
    201: z.object({
      message: z.string(),
      token: z.string(),
      user: z.object({
        id: z.string(),
        email: z.string(),
        name: z.string()
      })
    }),
    400: z.object({
      error: z.string()
    })
  }
};

export const handler: Handlers['RegisterAPI'] = async (req, { logger }) => {
  const { email, password, name } = req.body;
  
  logger.info('User registration attempt', { email });
  
  // Check if user already exists
  const existingUser = db.get<User>('users', email);
  if (existingUser) {
    return {
      status: 400,
      body: { error: 'User already exists' }
    };
  }
  
  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const timestamp = new Date().toISOString();
  
  // Hash password (in production, use bcrypt)
  const passwordHash = Buffer.from(password).toString('base64');
  
  // Store user in file-based db
  db.set<User>('users', email, {
    id: userId,
    email,
    name,
    passwordHash,
    createdAt: timestamp,
    profile: null
  });
  
  // Generate JWT token for auto-login after registration
  const token = `jwt_${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  // Store session
  db.set<Session>('sessions', token, {
    userId,
    email,
    createdAt: timestamp,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });
  
  logger.info('User registered successfully', { userId, email });
  
  return {
    status: 201,
    body: {
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        name
      }
    }
  };
};
