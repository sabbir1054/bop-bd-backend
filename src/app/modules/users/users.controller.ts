import { Staff, User } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/paginationFields';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { userFilterableFields } from './user.constant';
import { UserServices } from './users.service';

const updateUserProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.updateUserProfile(req, next);
    console.log(result);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User updated ',
      data: result,
    });
  },
);
const userVerifiedStatusChange = catchAsync(
  async (req: Request, res: Response) => {
    const { userId, status } = req.body;
    const { role } = req.user as any;
    const result = await UserServices.userVerifiedStatusChange(
      status,
      userId,
      role,
    );
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
    message: 'User profile remove ',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, paginationFields);
  const result = await UserServices.getAll(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieve',
    data: result.data,
    meta: result.meta,
  });
});
const getSingle = catchAsync(async (req: Request, res: Response) => {
  const { id: userId, role } = req.user as any;
  const { profileId } = req.params;
  const result = await UserServices.getSingle(userId, profileId, role);
  sendResponse<User | Staff>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile retrieve',
    data: result,
  });
});
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await UserServices.deleteUser(userId);
  sendResponse<User | Staff>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile deleted',
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

const getOrganizationStaff = catchAsync(async (req: Request, res: Response) => {
  const { id: userId, role } = req.user as any;

  const result = await UserServices.getOrganizationStaff(
    userId,
    role,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieve',
    data: result,
  });
});
const getMyDeliveryBoy = catchAsync(async (req: Request, res: Response) => {
  const { id: userId, role } = req.user as any;

  const result = await UserServices.getMyDeliveryBoy(userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieve',
    data: result,
  });
});
const deleteMySingleStaff = catchAsync(async (req: Request, res: Response) => {
  const { id: userId, role } = req.user as any;
  const { staffId } = req.params;
  const result = await UserServices.deleteMySingleStaff(userId, role, staffId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Staff deleted successfully ',
    data: result,
  });
});
const updateMySingleStaffRole = catchAsync(
  async (req: Request, res: Response) => {
    const { id: userId, role } = req.user as any;
    const result = await UserServices.updateMySingleStaffRole(
      userId,
      role,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Staff role updated',
      data: result,
    });
  },
);

export const UserController = {
  updateUserProfile,
  removeProfilePicture,
  getAll,
  getSingle,
  deleteUnverifiedOtp,
  userVerifiedStatusChange,
  getOrganizationStaff,
  getMyDeliveryBoy,
  deleteMySingleStaff,
  updateMySingleStaffRole,
  deleteUser,
};
