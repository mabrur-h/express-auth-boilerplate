import { type User } from '@prisma/client';
import { type Request } from 'express';

export interface RequestWithUser extends Request {
  user: User;
}

export interface IToken {
  refreshToken: string;
  accessToken: string;
}

export interface IUser {
  id: string;
  email: string;
  name: string | null;
  password: string | null | undefined;
  googleId: string | null;
  emailVerified: boolean;
  emailVerificationToken: string | null;
  emailTokenExpires: Date | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  requestCount: number;
  createdAt: Date;
  updatedAt: Date;
}
