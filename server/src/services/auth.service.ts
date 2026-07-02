import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { generateToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../utils/validators/auth.validator';

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AuthError';
  }
}

export async function registerUser(input: RegisterInput) {
  const { name, email, password } = input;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AuthError('An account with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({ name, email, passwordHash });

  const token = generateToken({ userId: user._id.toString(), email: user.email });

  return { user: sanitizeUser(user), token };
}

export async function loginUser(input: LoginInput) {
  const { email, password } = input;

  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user) {
    throw new AuthError('Invalid email or password', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AuthError('Invalid email or password', 401);
  }

  user.lastSeen = new Date();
  await user.save();

  const token = generateToken({ userId: user._id.toString(), email: user.email });

  return { user: sanitizeUser(user), token };
}

function sanitizeUser(user: IUser) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    isVerified: user.isVerified,
  };
}