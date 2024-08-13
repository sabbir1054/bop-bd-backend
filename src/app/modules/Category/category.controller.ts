import { Category } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CategoryServices } from './category.services';

const createNew = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryServices.createNew(req);

  sendResponse<Category>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category created',
    data: result,
  });
});

const removePhoto = catchAsync(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const result = await CategoryServices.removePhoto(categoryId);

  sendResponse<Category>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category photo delete',
    data: result,
  });
});
const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryServices.getAll();
  sendResponse<Category[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category retrieve',
    data: result,
  });
});
const getSingle = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryServices.getSingle(req.params.id);
  sendResponse<Category>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category retrieve',
    data: result,
  });
});

const updateSingle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const result = await CategoryServices.updateSingle(id, data);
  sendResponse<Category>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category updated !',
    data: result,
  });
});

const deleteSingle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await CategoryServices.deleteSingle(id);
  sendResponse<Category>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category deleted !',
    data: result,
  });
});
export const CategoryController = {
  createNew,
  getAll,
  getSingle,
  updateSingle,
  deleteSingle,
  removePhoto,
};
