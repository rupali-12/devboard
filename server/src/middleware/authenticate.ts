import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'

export interface AuthRequest extends Request {
  user?: {
    userId: string
    email: string
  }
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.jwt

  if (!token) {
    res.status(401).json({ error: 'Not authenticated. Please log in.' })
    return
  }

  try {
    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (err) {
    res.clearCookie('jwt')
    res.status(401).json({ error: 'Session expired. Please log in again.' })
  }
}