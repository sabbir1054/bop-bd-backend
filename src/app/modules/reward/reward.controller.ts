import { RewardPoints } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { RewardServices } from './reward.services';

const createNew = catchAsync(async (req: Request, res: Response) => {
  const result = await RewardServices.createNew(req.body);
  sendResponse<RewardPoints>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reward created',
    data: result,
  });
});
const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await RewardServices.getAll();
  sendResponse<RewardPoints[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reward retrieve retrieve',
    data: result,
  });
});
const getSingle = catchAsync(async (req: Request, res: Response) => {
  const result = await RewardServices.getSingle(req.params.id);
  sendResponse<RewardPoints>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reward retrieve',
    data: result,
  });
});

const updateSingle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const result = await RewardServices.updateSingle(id, data);
  sendResponse<RewardPoints>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reward updated !',
    data: result,
  });
});

const deleteSingle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await RewardServices.deleteSingle(id);
  sendResponse<RewardPoints>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reward deleted !',
    data: result,
  });
});

export const RewardController = {
  createNew,
  getAll,
  getSingle,
  updateSingle,
  deleteSingle,
};
