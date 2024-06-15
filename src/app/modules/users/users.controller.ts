import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserServices } from './users.service';

const updateUserProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.updateUserProfile(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated ',
    data: result,
  });
});

export const UserController = {
  updateUserProfile,
};
