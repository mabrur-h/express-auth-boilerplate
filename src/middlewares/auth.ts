import { type NextFunction, type Response } from 'express';
import { verify } from 'jsonwebtoken';
import { ApiError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import environment from '@/lib/environment';
import { type RequestWithUser } from '@/interface/auth.interface';

export const verifyAuthToken = async (
  req: RequestWithUser,
  _res: Response,
  next: NextFunction
) => {
  const { jwtSecretKey } = environment;
  try {
    const Authorization = req.headers.authorization
      ? req.headers.authorization?.split('Bearer ')[1]
      : null;
    console.log(Authorization);

    if (Authorization) {
      const secretKey: string = jwtSecretKey;
      const verificationResponse = verify(Authorization, secretKey) as {
        userId: string;
        email: string;
      };
      const userId = verificationResponse.userId;
      const findUser = await prisma.user.findUnique({ where: { id: userId } });
      if (findUser) {
        req.user = findUser;
        next();
      } else {
        next(new ApiError(401, 'Wrong authentication token'));
      }
    } else {
      next(new ApiError(401, 'Authentication token missing'));
    }
  } catch (e) {
    console.log(e);
    next(new ApiError(401, 'Wrong authentication token'));
  }
};
