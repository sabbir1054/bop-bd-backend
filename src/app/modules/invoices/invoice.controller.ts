import { Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { InvoiceServices } from './invoice.services';

const genaretInvoice = catchAsync(async (req: any, res: Response) => {
  await InvoiceServices.generateInvoice(req, res);
});

export const InvoiceController = {
  genaretInvoice,
};
