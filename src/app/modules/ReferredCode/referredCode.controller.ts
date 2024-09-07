import { RefferedCode } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ReferredCodeService } from './referredCode.services';

const createNew = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as any;

  const result = await ReferredCodeService.createNew(userId, req.body);
  sendResponse<RefferedCode>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Referred code created',
    data: result,
  });
});
const getAll = catchAsync(async (req: Request, res: Response) => {
  const { id: userId, role } = req.user as any;

  const result = await ReferredCodeService.getAll(userId, role);
  sendResponse<RefferedCode[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Referred code retrieve',
    data: result,
  });
});
const getSingle = catchAsync(async (req: Request, res: Response) => {
  const result = await ReferredCodeService.getSingle(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Referred code retrieve',
    data: result,
  });
});

const updateSingle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const result = await ReferredCodeService.updateSingle(id, data);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Referred code updated !',
    data: result,
  });
});

const deleteSingle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ReferredCodeService.deleteSingle(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Referred code deleted !',
    data: result,
  });
});

export const ReferredCodeController = {
  createNew,
  getAll,
  getSingle,
  updateSingle,
  deleteSingle,
};
