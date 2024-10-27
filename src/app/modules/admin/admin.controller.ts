import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AdminServices } from './admin.services';

const BOPCommissionInfo = catchAsync(async (req: Request, res: Response) => {
  const { id, role } = req.user as any;
  const result = await AdminServices.BOPCommissionInfo();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Commission info found retrieve !',
    data: result,
  });
});

export const AdminController = { BOPCommissionInfo };
