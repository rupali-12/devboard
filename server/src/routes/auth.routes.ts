import { Router, Request, Response } from 'express';
import { registerUser, loginUser, AuthError } from '../services/auth.service';
import { registerSchema, loginSchema } from '../utils/validators/auth.validator';
import { validate } from '../middleware/validate';
import { setTokenCookie, clearTokenCookie, generateToken } from '../utils/jwt';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { User } from '../models/User';

const router = Router();

router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { user, token } = await registerUser(req.body);
    setTokenCookie(res, token);
    res.status(201).json({ user });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { user, token } = await loginUser(req.body);
    setTokenCookie(res, token);
    res.status(200).json({ user });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  clearTokenCookie(res);
  res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified,
    },
  });
});

// GET /auth/socket-token — returns a short-lived token for Socket.io auth
// This is needed because httpOnly cookies can't be read by JS
// but Socket.io handshake needs a token
router.get('/socket-token', authenticate, (req: AuthRequest, res: Response) => {
  const token = generateToken({
    userId: req.user!.userId,
    email: req.user!.email,
  })
  res.json({ token })
})

export default router;