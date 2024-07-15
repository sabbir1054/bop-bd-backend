import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IRangeOfDate } from './organization.interface';
import { OrganizaionServices } from './organization.service';

const getDashboardMatrics = catchAsync(async (req: Request, res: Response) => {
  const { id: userId, role } = req.user as any;

  const result = await OrganizaionServices.getDashboardMatrics(userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard all matrics ',
    data: result,
  });
});

export const OrganizationController = {
  getDashboardMatrics,
};
