import { type NextFunction, type Request } from 'express';
import { HttpStatusCode } from 'axios';
import UserService from './auth.service';
import Api from '@/lib/api';
import { type CustomResponse } from '@/types/common.type';
import { type IToken, type IUser } from '@/interface/auth.interface';

export default class AuthController extends Api {
  private readonly userService = new UserService();

  public signUp = async (
    req: Request,
    res: CustomResponse<{ user: IUser; token: IToken }>,
    next: NextFunction
  ) => {
    try {
      const data = await this.userService.signUp(req.body);
      this.send(res, data, HttpStatusCode.Created, 'signUp');
    } catch (e) {
      next(e);
    }
  };

  public login = async (
    req: Request,
    res: CustomResponse<{ user: IUser; token: IToken }>,
    next: NextFunction
  ) => {
    try {
      const data = await this.userService.login(req.body);
      this.send(res, data, HttpStatusCode.Created, 'login');
    } catch (e) {
      next(e);
    }
  };

  public verifyEmail = async (
    req: Request,
    res: CustomResponse<{ data: { message: string } }>,
    next: NextFunction
  ) => {
    try {
      const { token } = req.params as { token: string };
      const data = await this.userService.verifyEmailToken(token);
      this.send(res, data, HttpStatusCode.Ok, 'verifyEmail');
    } catch (e) {
      next(e);
    }
  };

  public requestForgotPassword = async (
    req: Request,
    res: CustomResponse<{ data: { message: string } }>,
    next: NextFunction
  ) => {
    try {
      const { email } = req.body;
      const data = await this.userService.forgotPasswordRequest(email);
      this.send(res, data, HttpStatusCode.Ok, 'requestForgotPassword');
    } catch (e) {
      next(e);
    }
  };

  public resetPassword = async (
    req: Request,
    res: CustomResponse<{ isReset: boolean }>,
    next: NextFunction
  ) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
      const data = await this.userService.resetPassword(token, password);
      this.send(res, data, HttpStatusCode.Accepted, 'resetPassword');
    } catch (e) {
      next(e);
    }
  };
}
