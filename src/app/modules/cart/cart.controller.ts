import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CartServices } from './cart.service';

const updateCartSingle = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { id: userId, role } = req.user as any;
  const { action } = req.body;

  const result = await CartServices.updateCartSingle(
    userId,
    role,
    productId,
    action,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Cart updated',
    data: result,
  });
});
const updateCartMultiple = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { id: userId, role } = req.user as any;
  const { action, quantity } = req.body;

  const result = await CartServices.updateCartMultiple(
    userId,
    role,
    productId,
    action,
    quantity,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Cart updated',
    data: result,
  });
});
const removeProductFromCart = catchAsync(
  async (req: Request, res: Response) => {
    const { id: userId, role } = req.user as any;
    const { cartItemIds } = req.body;

    const result = await CartServices.removeItemsFromCart(
      userId,
      role,
      cartItemIds,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Cart updated',
      data: result,
    });
  },
);
const getMyCart = catchAsync(async (req: Request, res: Response) => {
  const { id: userId, role } = req.user as any;
  const result = await CartServices.getMyCart(userId, role);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Cart retrieve',
    data: result,
  });
});
const getSingleUserCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const result = await CartServices.getSingleUserCart(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Cart retrieve',
    data: result,
  });
});

export const CartController = {
  updateCartSingle,
  updateCartMultiple,
  removeProductFromCart,
  getMyCart,
  getSingleUserCart,
};
