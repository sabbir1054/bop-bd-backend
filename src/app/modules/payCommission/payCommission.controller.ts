import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PayCommissionServices } from './payCommission.services';

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const { id, role } = req.user as any;
  const result = await PayCommissionServices.createPayment(req.body, id, role);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Paycommission created',
    data: result,
  });
});
const executePaymentHit = catchAsync(async (req: Request, res: Response) => {
  const result = await PayCommissionServices.executePaymentHit(
    req.body.paymentID,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Pay successully',
    data: result,
  });
});
const getOrganizationPayCommissionHistory = catchAsync(
  async (req: Request, res: Response) => {
    const { id, role } = req.user as any;
    const result =
      await PayCommissionServices.getOrganizationPayCommissionHistory(id, role);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Pay commission history retrieve successully',
      data: result,
    });
  },
);

export const PayCommissionController = {
  createPayment,
  executePaymentHit,
  getOrganizationPayCommissionHistory,
};
