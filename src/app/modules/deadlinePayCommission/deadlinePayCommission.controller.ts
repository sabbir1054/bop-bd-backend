import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { DeadlinePayCommissionServices } from './deadlinePayCommission.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await DeadlinePayCommissionServices.createNew(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Deadline created created',
    data: result,
  });
});
const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await DeadlinePayCommissionServices.getAll();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Deadline retrieve',
    data: result,
  });
});
const updatedSingle = catchAsync(async (req: Request, res: Response) => {
  const result = await DeadlinePayCommissionServices.updateSingle(
    req.body.deadline,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Deadline updated',
    data: result,
  });
});
const deleteSingle = catchAsync(async (req: Request, res: Response) => {
  const result = await DeadlinePayCommissionServices.deleteSingle();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Deadline deleted',
    data: result,
  });
});

export const DeadlinePayCommissionController = {
  create,
  getAll,
  updatedSingle,
  deleteSingle,
};
