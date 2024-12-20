import { NextFunction, Request, Response } from 'express';
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

const getSingle = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductServices.getSingle(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product retrieve ',
    data: result,
  });
});

const deleteImageFromProduct = catchAsync(
  async (req: Request, res: Response) => {
    const { imageId, productId } = req.params;
    const { id: userId, role } = req.user as any;

    const result = await ProductServices.deleteImageFromProduct(
      imageId,
      productId,
      userId,
      role,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Product photo updated ',
      data: result,
    });
  },
);

const addImageToProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductServices.addNewImageForProduct(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product photo updated ',
    data: result,
  });
});
const updateProductInfo = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { id: userId, role } = req.user as any;
  const payload = req.body;

  const result = await ProductServices.updateProductInfo(
    productId,
    userId,
    role,
    payload,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product info updated ',
    data: result,
  });
});

const deleteProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const { id: userId, role } = req.user as any;

    const result = await ProductServices.deleteProduct(
      productId,
      userId,
      role,
      next,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Product deleted ',
      data: result,
    });
  },
);

export const ProductController = {
  createProduct,
  getAllProducts,
  getSingle,
  deleteImageFromProduct,
  addImageToProduct,
  updateProductInfo,
  deleteProduct,
};
