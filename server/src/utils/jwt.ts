import jwt from 'jsonwebtoken'
import { Response } from 'express'

interface TokenPayload {
  userId: string
  email: string
}

export function generateToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not defined')
  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  })
}

export function verifyToken(token: string): TokenPayload {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not defined')
  return jwt.verify(token, secret) as TokenPayload
}

export function setTokenCookie(res: Response, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production'
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction,           // HTTPS only in production
    sameSite: isProduction ? 'none' : 'lax',  // 'none' needed for cross-domain
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

export function clearTokenCookie(res: Response): void {
  const isProduction = process.env.NODE_ENV === 'production'
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  })
}