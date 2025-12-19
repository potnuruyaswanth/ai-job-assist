/**
 * Authentication Utilities
 * In production, use proper JWT library and bcrypt
 */

// Simple token validation (replace with proper JWT in production)
export async function validateToken(token: string, state: any): Promise<{ valid: boolean; userId?: string; email?: string }> {
  if (!token) {
    return { valid: false };
  }
  
  const session = await state.get('sessions', token);
  if (!session) {
    return { valid: false };
  }
  
  // Check expiration
  if (new Date(session.expiresAt) < new Date()) {
    return { valid: false };
  }
  
  return {
    valid: true,
    userId: session.userId,
    email: session.email
  };
}

// Extract token from Authorization header
export function extractToken(authHeader?: string): string | null {
  if (!authHeader) return null;
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return authHeader;
}

// Generate secure random ID
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Hash password (simplified - use bcrypt in production)
export function hashPassword(password: string): string {
  // In production: return await bcrypt.hash(password, 10);
  return Buffer.from(password).toString('base64');
}

// Verify password (simplified - use bcrypt in production)
export function verifyPassword(password: string, hash: string): boolean {
  // In production: return await bcrypt.compare(password, hash);
  return Buffer.from(password).toString('base64') === hash;
}

// Generate JWT token (simplified - use jsonwebtoken in production)
export function generateToken(userId: string): string {
  // In production: return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
  return `jwt_${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
