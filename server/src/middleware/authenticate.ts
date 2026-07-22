import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  console.log("Cookies:", req.cookies);
  console.log("Cookie header:", req.headers.cookie);

  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({
      error: "Not authenticated",
      cookies: req.cookies,
      header: req.headers.cookie,
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    res.clearCookie("jwt");
    return res.status(401).json({
      error: "Invalid token",
    });
  }
}