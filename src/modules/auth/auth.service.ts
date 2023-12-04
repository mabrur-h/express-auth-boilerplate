import { randomBytes } from 'crypto';
import { type User } from '@prisma/client';
import { sign as jwtSign } from 'jsonwebtoken';
import EmailService from '../email/email.service';
import prisma from '@/lib/prisma';
import LogMessage from '@/decorators/log-message.decorator';
import { comparePassword, hashPassword } from '@/lib/bcrypt';
import { ApiError } from '@/lib/errors';
import environment from '@/lib/environment';

export default class AuthService {
  private readonly emailService = new EmailService();
  private readonly jwtSecretKey = environment.jwtSecretKey;

  @LogMessage<[User]>({ message: 'test-decorator' })
  public async signUp(data: User) {
    const { email, password } = data;

    if (!password) throw new ApiError(400, 'Password is required');

    const isEmailExists = await prisma.user.findFirst({ where: { email } });
    if (isEmailExists)
      throw new ApiError(409, 'User with this email already exists');

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const emailVerificationToken = this._generateToken(24);
    // const verificationLink = `https://localhost:3030/verify-email/${emailVerificationToken}`;
    console.log('Verification Token: ', emailVerificationToken);
    // TODO: Uncomment after implementing aws ses
    // await this.emailService.sendVerificationEmail(email, verificationLink)
    const emailTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

    const refreshToken = this._createRefreshToken({
      userId: newUser.id,
      email: newUser.email,
    });
    const accessToken = this._createAccessToken({
      userId: newUser.id,
      email: newUser.email,
    });

    await prisma.user.update({
      data: { emailVerificationToken, emailTokenExpires },
      where: { id: newUser.id },
    });

    return {
      user: { ...newUser, password: undefined },
      token: { refreshToken, accessToken },
    }; // Exclude password from the response
  }

  @LogMessage<[User]>({ message: 'test-decorator' })
  public async login(data: User) {
    const { email, password } = data;
    if (!password) throw new ApiError(400, 'Password is required');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ApiError(404, 'User with this email not found');

    if (!user.password) throw new ApiError(400, 'Please sign in using Google');

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) throw new ApiError(409, 'Password is not matching');

    const refreshToken = this._createRefreshToken({
      userId: user.id,
      email: user.email,
    });
    const accessToken = this._createAccessToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: { ...user, password: undefined },
      token: { refreshToken, accessToken },
    }; // Exclude password from the response
  }

  @LogMessage<any>({ message: 'test-decorator' })
  public async forgotPasswordRequest(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    // Generate a unique token for password reset
    const passwordResetToken = this._generateToken(24); // Adjust token length as needed
    const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user record with password reset token and its expiration time
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpires,
      },
    });

    // TODO: Uncomment after configuring aws ses
    // Send an email to the user with this token
    // const resetLink = `https://yourdomain.com/reset-password?token=${passwordResetToken}`;
    console.log('Reset Token: ', passwordResetToken);
    // await this.emailService.sendVerificationEmail(user.email, resetLink);

    return { message: 'Password reset email sent' };
  }

  @LogMessage<any>({ message: 'test-decorator' })
  public async verifyEmailToken(token: string) {
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailTokenExpires: {
          gt: new Date(), // gt means greater than
        },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired email verification token');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailTokenExpires: null,
      },
    });

    return { message: 'New password set successfuly' };
  }

  public async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired password reset token');
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return true;
  }

  // --- Private methods ---
  private _createRefreshToken(payload: {
    userId: string;
    email: string;
  }): string {
    const secretKey: string = this.jwtSecretKey;
    const expiresIn: number = 60 * 60 * 24 * 10; // 10 days

    return jwtSign(payload, secretKey, {
      expiresIn,
    });
  }

  private _createAccessToken(payload: {
    userId: string;
    email: string;
  }): string {
    const secretKey: string = this.jwtSecretKey;
    const expiresIn: number = 60 * 60 * 24 * 10; // 10 days

    return jwtSign(payload, secretKey, {
      expiresIn,
    });
  }

  private _generateToken(length: number = 24): string {
    return randomBytes(length).toString('hex');
  }
}
