import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/paginationFields';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { productFilterableFields } from './product.constant';
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

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, productFilterableFields);
  const options = pick(req.query, paginationFields);
  const result = await ProductServices.getAllProduct(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product retrieve successfully !!',
    meta: result.meta,
    data: result.data,
  });
});

export const ProductController = {
  createProduct,
  getAllProducts,
};
