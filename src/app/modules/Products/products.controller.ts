import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ProductServices } from './products.service';

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductServices.createNew(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product added ',
    data: result,
  });
});

export const ProductController = {
  createProduct,
};
