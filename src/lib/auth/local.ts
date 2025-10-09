import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || 'dev-secret-change-in-production';
const SESSION_MAX_AGE = parseInt(process.env.SESSION_MAX_AGE || '604800', 10);

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, AUTH_SECRET, {
    expiresIn: SESSION_MAX_AGE,
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, AUTH_SECRET) as TokenPayload;
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    return null;
  }
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}
