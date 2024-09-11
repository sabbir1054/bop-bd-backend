import { Commission } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CommissionServices } from './commission.services';

const createNew = catchAsync(async (req: Request, res: Response) => {
  const result = await CommissionServices.createNew(req.body);
  sendResponse<Commission>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Commission created',
    data: result,
  });
});
const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await CommissionServices.getAll();
  sendResponse<Commission[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Commission retrieve retrieve',
    data: result,
  });
});
const getSingle = catchAsync(async (req: Request, res: Response) => {
  const result = await CommissionServices.getSingle(req.params.id);
  sendResponse<Commission>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Commission retrieve',
    data: result,
  });
});

const updateSingle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const result = await CommissionServices.updateSingle(id, data);
  sendResponse<Commission>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Commission updated !',
    data: result,
  });
});

const deleteSingle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await CommissionServices.deleteSingle(id);
  sendResponse<Commission>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Commission deleted !',
    data: result,
  });
});

export const CommissionController = {
  createNew,
  getAll,
  getSingle,
  updateSingle,
  deleteSingle,
};
