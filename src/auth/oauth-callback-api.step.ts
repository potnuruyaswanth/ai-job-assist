import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { db } from '../utils/db';

interface OAuthState {
  userId: string;
  provider: string;
  createdAt: string;
}

interface SocialAccount {
  id: string;
  userId: string;
  platform: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  connectedAt: string;
}

export const config: ApiRouteConfig = {
  name: 'OAuthCallbackAPI',
  type: 'api',
  path: '/auth/oauth/callback',
  method: 'GET',
  description: 'OAuth callback handler for social login',
  emits: [],
  flows: ['auth-flow'],
  responseSchema: {
    200: z.object({
      message: z.string(),
      provider: z.string(),
      connected: z.boolean()
    }),
    400: z.object({
      error: z.string()
    })
  }
};

export const handler: Handlers['OAuthCallbackAPI'] = async (req, { logger }) => {
  const { code, state: oauthState, provider } = req.queryParams;
  
  logger.info('OAuth callback received', { provider, oauthState });
  
  // Verify OAuth state
  const storedOAuthState = db.get<OAuthState>('oauth_states', oauthState);
  if (!storedOAuthState) {
    return {
      status: 400,
      body: { error: 'Invalid OAuth state' }
    };
  }
  
  const { userId } = storedOAuthState;
  const timestamp = new Date().toISOString();
  
  // In production, exchange code for tokens with the OAuth provider
  // This is a simplified mock
  const mockAccessToken = `access_${provider}_${Date.now()}`;
  const mockRefreshToken = `refresh_${provider}_${Date.now()}`;
  const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
  
  // Store social account connection
  const socialAccountId = `social_${userId}_${provider}`;
  db.set<SocialAccount>('social_accounts', socialAccountId, {
    id: socialAccountId,
    userId,
    platform: provider,
    accessToken: mockAccessToken, // Encrypt in production
    refreshToken: mockRefreshToken,
    expiresAt,
    connectedAt: timestamp
  });
  
  // Clean up OAuth state
  db.delete('oauth_states', oauthState);
  
  logger.info('OAuth connection successful', { userId, provider });
  
  return {
    status: 200,
    body: {
      message: `Successfully connected ${provider}`,
      provider,
      connected: true
    }
  };
};
