import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/paginationFields';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { AdminServices, orderFilterableFieldsAdmin } from './admin.services';

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
const BOPuserInfo = catchAsync(async (req: Request, res: Response) => {
  const { id, role } = req.user as any;
  const result = await AdminServices.BOPuserInfo();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users info retrieve !',
    data: result,
  });
});
const cashTransactionHistory = catchAsync(
  async (req: Request, res: Response) => {
    const options = pick(req.query, paginationFields);
    const result = await AdminServices.cashTransactionHistory(options);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Cash transaction retrieve successfully !!',
      meta: result.meta,
      data: result.data,
    });
  },
);
const claimedRewardTransactionHistory = catchAsync(
  async (req: Request, res: Response) => {
    const options = pick(req.query, paginationFields);
    const result = await AdminServices.claimedRewardTransactionHistory(options);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Claimed reward retrieve successfully !!',
      meta: result.meta,
      data: result.data,
    });
  },
);
const smsBalanceCheck = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.smsBalanceCheck();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Balance retrieve successfully !!',

    data: result,
  });
});
const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, orderFilterableFieldsAdmin);
  const options = pick(req.query, paginationFields);
  const result = await AdminServices.getAllOrders(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organization retrieve successfully !!',
    meta: result.meta,
    data: result.data,
  });
});
export const AdminController = {
  BOPCommissionInfo,
  cashTransactionHistory,
  claimedRewardTransactionHistory,
  BOPuserInfo,
  smsBalanceCheck,
  getAllOrders,
};
