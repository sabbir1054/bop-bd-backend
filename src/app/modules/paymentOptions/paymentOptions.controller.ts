import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PaymentSystemOptionsService } from './paymentOptions.services';

const createNew = catchAsync(async (req: Request, res: Response) => {
  const { id: userId, role } = req.user as any;

  const result = await PaymentSystemOptionsService.createNew(
    userId,
    role,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment options created',
    data: result,
  });
});

const getSingle = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentSystemOptionsService.getSingle(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment options retrieve',
    data: result,
  });
});

const updateSingle = catchAsync(async (req: Request, res: Response) => {
  const { id: userId, role } = req.user as any;
  const { id } = req.params;
  const data = req.body;
  const result = await PaymentSystemOptionsService.updateSingle(
    userId,
    role,
    id,
    data,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment options updated !',
    data: result,
  });
});

const deleteSingle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { id: userId, role } = req.user as any;
  const result = await PaymentSystemOptionsService.deleteSingle(
    userId,
    role,
    id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment options deleted !',
    data: result,
  });
});

export const PaymentOptionsController = {
  createNew,
  getSingle,
  updateSingle,
  deleteSingle,
};
