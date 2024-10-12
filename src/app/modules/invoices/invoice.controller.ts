import { NextFunction, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { InvoiceServices } from './invoice.services';

const genaretInvoice = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    await InvoiceServices.generateInvoice(req, res, next);
  },
);

export const InvoiceController = {
  genaretInvoice,
};
