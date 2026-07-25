import jwt from 'jsonwebtoken';
import { Response } from 'express';

interface TokenPayload {
  userId: string;
  email: string;
}

function getExpiresIn(): jwt.SignOptions['expiresIn'] {
  const configured = process.env.JWT_EXPIRES_IN;
  if (configured && /^\d+[smhd]$/i.test(configured)) {
    return configured as jwt.SignOptions['expiresIn'];
  }

  return '7d';
}

export function generateToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(payload, secret, {
    expiresIn: getExpiresIn(),
  });
}

export function verifyToken(token: string): TokenPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.verify(token, secret) as TokenPayload;
}

export function setTokenCookie(res: Response, token: string): void {
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearTokenCookie(res: Response): void {
  res.clearCookie('jwt');
}