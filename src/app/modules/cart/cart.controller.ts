import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CartServices } from './cart.service';

const updateCartSingle = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { id: userId } = req.user as any;
  const { action } = req.body;

  const result = await CartServices.updateCartSingle(userId, productId, action);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Product added to the cart',
    data: result,
  });
});

export const CartController = {
  updateCartSingle,
};
