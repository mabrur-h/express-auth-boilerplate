import jwt from 'jsonwebtoken';
import environment from '@/lib/environment';
const { jwtSecretKey } = environment;

const secretKey: string = jwtSecretKey; // Ensure this is set in your environment variables

export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, secretKey, { expiresIn: '10d' });
};
