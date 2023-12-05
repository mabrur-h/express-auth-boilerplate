import { Router } from 'express';
import Controller from './auth.controller';
import RequestValidator from '@/middlewares/request-validator';
import { EmailDto, LoginDto, PasswordDto, SignupDto } from '@/dto/auth.dto';

const auth: Router = Router();
const controller = new Controller();

auth.post('/signup', RequestValidator.validate(SignupDto), controller.signUp);
auth.post('/login', RequestValidator.validate(LoginDto), controller.login);
auth.get('/verify-email/:token', controller.verifyEmail);
auth.post(
  '/forgot-password',
  RequestValidator.validate(EmailDto),
  controller.requestForgotPassword
);
auth.put(
  '/reset-password/:token',
  RequestValidator.validate(PasswordDto),
  controller.resetPassword
);

export default auth;
