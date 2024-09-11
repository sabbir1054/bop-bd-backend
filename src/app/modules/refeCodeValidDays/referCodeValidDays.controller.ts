import { ValidityDays } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ReferCodeValidityServices } from './referCodeValidDays.services';

const createNew = catchAsync(async (req: Request, res: Response) => {
  const result = await ReferCodeValidityServices.createNew(req.body);
  sendResponse<ValidityDays>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Validity created type created',
    data: result,
  });
});
const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await ReferCodeValidityServices.getAll();
  sendResponse<ValidityDays[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Validity days types retrieve retrieve',
    data: result,
  });
});

const updateSingle = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const result = await ReferCodeValidityServices.updateSingle(data);
  sendResponse<ValidityDays>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Validity type updated !',
    data: result,
  });
});

const deleteSingle = catchAsync(async (req: Request, res: Response) => {
  const result = await ReferCodeValidityServices.deleteSingle();
  sendResponse<ValidityDays>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Validity days type deleted !',
    data: result,
  });
});

export const ReferCodeValidityController = {
  createNew,
  getAll,
  updateSingle,
  deleteSingle,
};
