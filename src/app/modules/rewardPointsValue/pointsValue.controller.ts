import { PointsValue } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PointsValueServices } from './pointsValue.services';

const createValueOfReward = catchAsync(async (req: Request, res: Response) => {
  const result = await PointsValueServices.createValueOfReward(
    req.body.perPointsTk,
  );
  sendResponse<PointsValue>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Value points created',
    data: result,
  });
});
const getValueOfReward = catchAsync(async (req: Request, res: Response) => {
  const result = await PointsValueServices.getValueOfReward();
  sendResponse<PointsValue[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Value points retrieve',
    data: result,
  });
});

const editPointsValue = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const result = await PointsValueServices.editPointsValue(data.perPointsTk);
  sendResponse<PointsValue>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'value point updated !',
    data: result,
  });
});

const deletePointsValue = catchAsync(async (req: Request, res: Response) => {
  const result = await PointsValueServices.deletePointsValue();
  sendResponse<PointsValue>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'points value deleted !',
    data: result,
  });
});

export const PointsValueController = {
  deletePointsValue,
  editPointsValue,
  getValueOfReward,
  createValueOfReward,
};
