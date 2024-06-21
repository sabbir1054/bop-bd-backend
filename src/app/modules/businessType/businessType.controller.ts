import { BusinessType } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { BusinessTypeServices } from './businessType.service';

const createNew = catchAsync(async (req: Request, res: Response) => {
  const result = await BusinessTypeServices.createNew(req.body);
  sendResponse<BusinessType>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Business type created',
    data: result,
  });
});
const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await BusinessTypeServices.getAll();
  sendResponse<BusinessType[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Business types retrieve retrieve',
    data: result,
  });
});
const getSingle = catchAsync(async (req: Request, res: Response) => {
  const result = await BusinessTypeServices.getSingle(req.params.id);
  sendResponse<BusinessType>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Business type retrieve',
    data: result,
  });
});

const updateSingle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const result = await BusinessTypeServices.updateSingle(id, data);
  sendResponse<BusinessType>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Business type updated !',
    data: result,
  });
});

const deleteSingle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await BusinessTypeServices.deleteSingle(id);
  sendResponse<BusinessType>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Business type deleted !',
    data: result,
  });
});
export const BusinessTypeController = {
  createNew,
  getAll,
  getSingle,
  updateSingle,
  deleteSingle,
};
