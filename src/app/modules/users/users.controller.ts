import { User } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserServices } from './users.service';

const updateUserProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.updateUserProfile(req, next);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User updated ',
      data: result,
    });
  },
);
const removeProfilePicture = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as any;
  const result = await UserServices.removeProfilePicture(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User photo removed ',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getAll();
  sendResponse<Partial<User>[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieve',
    data: result,
  });
});
const getSingle = catchAsync(async (req: Request, res: Response) => {
  const { id: userId, role } = req.user as any;
  const { profileId } = req.params;
  const result = await UserServices.getSingle(userId, profileId, role);
  sendResponse<User>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile retrieve',
    data: result,
  });
});
const deleteUnverifiedOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.deleteUnverifiedOtp(req.body.phone);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted',
    data: result,
  });
});

export const UserController = {
  updateUserProfile,
  removeProfilePicture,
  getAll,
  getSingle,
  deleteUnverifiedOtp,
};
