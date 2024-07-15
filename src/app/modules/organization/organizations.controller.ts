import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
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
const getOutgoingOrdersByDate = catchAsync(
  async (req: Request, res: Response) => {
    const { id: userId, role } = req.user as any;

    const result = await OrganizaionServices.getOutgoingOrdersByDate(
      userId,
      role,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Order info retrieve ',
      data: result,
    });
  },
);
const getIncomingOrdersByDate = catchAsync(
  async (req: Request, res: Response) => {
    const { id: userId, role } = req.user as any;

    const result = await OrganizaionServices.getIncomingOrdersByDate(
      userId,
      role,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Order info retrieve ',
      data: result,
    });
  },
);

export const OrganizationController = {
  getDashboardMatrics,
  getOutgoingOrdersByDate,
  getIncomingOrdersByDate,
};
