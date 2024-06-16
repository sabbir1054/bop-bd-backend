import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { OrderService } from './order.service';

const orderCreate = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.orderCreate(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Order placed done',
    data: result,
  });
});

export const OrderController = {
  orderCreate,
};
