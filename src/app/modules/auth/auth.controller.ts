import { User } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../../config';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IRefreshTokenResponse } from './auth.interface';
import { AuthServices } from './auth.service';

const userRegistration = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.userRegistration(req.body);
  sendResponse<Partial<User>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User registered',
    data: result,
  });
});

const userLogin = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.userLogin(req.body);
  const { refreshToken, ...others } = result;
  // set refresh token in cookies
  const cookieOption = {
    secure: config.env === 'production',
    httpOnly: true,
  };

  res.cookie('refreshToken', refreshToken, cookieOption);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Login successfully',
    data: others,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  const result = await AuthServices.refreshToken(refreshToken);
  // set refresh token into cookie
  const cookieOptions = {
    secure: config.env === 'production',
    httpOnly: true,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse<IRefreshTokenResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully',
    data: result,
  });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const result: any = await AuthServices.verifyOTP(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result?.message,
    data: result?.result,
  });
});
const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.resendOtp(req.body.phone);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Otp resend done',
    data: result,
  });
});

const forgetPasswordOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.forgetPasswordOtp(req.body.phone);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Otp send done',
    data: result,
  });
});
const resendForgetpasswordOtp = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AuthServices.resendForgetpasswordOtp(req.body.phone);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Otp re send done',
      data: result,
    });
  },
);

const verifyForgotPasswordOtp = catchAsync(
  async (req: Request, res: Response) => {
    const { phone, otp } = req.body;
    const result = await AuthServices.verifyForgotPasswordOtp(phone, otp);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Otp matched',
      data: result,
    });
  },
);

const updatePassword = catchAsync(async (req: Request, res: Response) => {
  const { phone, newPassword } = req.body;
  const result = await AuthServices.updatePassword(newPassword, phone);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Passwod changed',
    data: result,
  });
});

export const AuthController = {
  userRegistration,
  userLogin,
  refreshToken,
  verifyOtp,
  resendOtp,
  forgetPasswordOtp,
  resendForgetpasswordOtp,
  verifyForgotPasswordOtp,
  updatePassword,
};
