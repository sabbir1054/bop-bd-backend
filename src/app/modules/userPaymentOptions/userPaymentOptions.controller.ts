import { PaymentSystemOptions } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserPaymentOptionsService } from './usePaymentOptions.services';

const createPaymentOptions = catchAsync(async (req: Request, res: Response) => {
  const { id: userId, role } = req.user as any;
  const result = await UserPaymentOptionsService.createPaymentOptions(
    userId,
    role,
    req.body,
  );
  sendResponse<PaymentSystemOptions>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment system options created',
    data: result,
  });
});

export const UserPaymentOptionsController = {
  createPaymentOptions,
};
