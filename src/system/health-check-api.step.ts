import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';

export const config: ApiRouteConfig = {
  name: 'HealthCheckAPI',
  type: 'api',
  path: '/health',
  method: 'GET',
  description: 'Health check endpoint',
  emits: [],
  flows: ['system-flow'],
  responseSchema: {
    200: z.object({
      status: z.string(),
      version: z.string(),
      timestamp: z.string(),
      services: z.object({
        database: z.string(),
        queue: z.string(),
        ai: z.string()
      })
    })
  }
};

export const handler: Handlers['HealthCheckAPI'] = async (_, { logger }) => {
  logger.info('Health check requested');
  
  return {
    status: 200,
    body: {
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        queue: 'connected',
        ai: 'available'
      }
    }
  };
};
