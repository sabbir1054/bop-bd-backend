import { Order } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/paginationFields';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { ordersFilterableFields } from './order.constant';
import { OrderService } from './order.service';

const orderCreate = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.orderCreate(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Order placed done',
    data: result,
  });
});
const getUserIncomingOrders = catchAsync(
  async (req: Request, res: Response) => {
    const { id: userId } = req.user as any;
    const result = await OrderService.getUserIncomingOrders(userId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Incoming orders retrieve',
      data: result,
    });
  },
);
const getUserOutgoingOrders = catchAsync(
  async (req: Request, res: Response) => {
    const { id: userId } = req.user as any;
    const result = await OrderService.getUserOutgoingOrders(userId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Outgoing orders retrieve',
      data: result,
    });
  },
);
const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as any;
  const { orderId } = req.params;
  const { status } = req.body;
  const result = await OrderService.updateOrderStatus(userId, orderId, status);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Order status updated ',
    data: result,
  });
});
const updatePaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as any;
  const { orderId } = req.params;
  const { status } = req.body;
  const result = await OrderService.updatePaymentStatus(
    userId,
    orderId,
    status,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Payment status updated ',
    data: result,
  });
});
const getSingle = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getSingle(req.params.id);
  sendResponse<Order>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Business type retrieve',
    data: result,
  });
});

const searchFilterIncomingOrders = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, ordersFilterableFields);
    const options = pick(req.query, paginationFields);
    const { id: userId } = req.user as any;
    const result = await OrderService.searchFilterIncomingOrders(
      userId,
      filters,
      options,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Orders retrieve successfully !!',
      meta: result.meta,
      data: result.data,
    });
  },
);
const searchFilterOutgoingOrders = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, ordersFilterableFields);
    const options = pick(req.query, paginationFields);
    const { id: userId } = req.user as any;
    const result = await OrderService.searchFilterOutgoingOrders(
      userId,
      filters,
      options,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Orders retrieve successfully !!',
      meta: result.meta,
      data: result.data,
    });
  },
);
export const OrderController = {
  orderCreate,
  getUserIncomingOrders,
  getUserOutgoingOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getSingle,
  searchFilterIncomingOrders,
  searchFilterOutgoingOrders,
};
