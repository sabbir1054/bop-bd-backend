import { Category } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CategoryServices } from './category.services';

const createNew = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryServices.createNew(req.body);
  sendResponse<Category>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category created',
    data: result,
  });
});

export const CategoryController = {
  createNew,
};
