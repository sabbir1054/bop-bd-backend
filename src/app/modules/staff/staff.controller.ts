import { User } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { staffServices } from './staff.service';

const getAll = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as any;
  const result = await staffServices.getAll(id);
  sendResponse<User[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Staff retrieve',
    data: result,
  });
});
const blockstaff = catchAsync(async (req: Request, res: Response) => {
  const { id, role } = req.user as any;
  const { staffId } = req.params;
  const result = await staffServices.blockstaff(id, role, staffId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Staff retrieve',
    data: result,
  });
});
const getSingle = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as any;
  const { id } = req.params;
  const result = await staffServices.getSingle(userId, id);
  sendResponse<User>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Staff retrieve',
    data: result,
  });
});

export const StaffController = {
  getAll,
  getSingle,
  blockstaff,
};
