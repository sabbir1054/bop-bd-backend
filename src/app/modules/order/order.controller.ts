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
  const { id: userId, role } = req.user as any;
  const result = await OrderService.orderCreate(userId, role, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Order placed done',
    data: result,
  });
});
const getOrganizationIncomingOrders = catchAsync(
  async (req: Request, res: Response) => {
    const { id: userId } = req.params;
    const options = pick(req.query, paginationFields);
    const result = await OrderService.getOrganizationIncomingOrders(
      userId,
      options,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Incoming orders retrieve',
      data: result,
    });
  },
);

const getOrganizationOutgoingOrders = catchAsync(
  async (req: Request, res: Response) => {
    const { id: userId } = req.params;
    const options = pick(req.query, paginationFields);
    const result = await OrderService.getOrganizationOutgoingOrders(
      userId,
      options,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Outgoing orders retrieve',
      data: result,
    });
  },
);
// const getOrganizationIncomingOrders = catchAsync(
//   async (req: Request, res: Response) => {
//     const { id: organizationId } = req.params;
//     const options = pick(req.query, paginationFields);
//     const result = await OrderService.getOrganizationIncomingOrders(
//       organizationId,
//       options,
//     );
//     sendResponse(res, {
//       success: true,
//       statusCode: httpStatus.OK,
//       message: 'Incoming orders retrieve',
//       data: result,
//     });
//   },
// );
// const getOrganizationOutgoingOrders = catchAsync(
//   async (req: Request, res: Response) => {
//     const { id: organizationId } = req.params;
//     const options = pick(req.query, paginationFields);
//     const result = await OrderService.getOrganizationOutgoingOrders(
//       organizationId,
//       options,
//     );
//     sendResponse(res, {
//       success: true,
//       statusCode: httpStatus.OK,
//       message: 'Outgoing orders retrieve',
//       data: result,
//     });
//   },
// );
const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id: userId, role } = req.user as any;
  const { orderId } = req.params;
  const { status } = req.body;
  const result = await OrderService.updateOrderStatus(
    userId,
    role,
    orderId,
    status,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Order status updated ',
    data: result,
  });
});
const updatePaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const { id: userId, role } = req.user as any;
  const { orderId } = req.params;
  const { status } = req.body;
  const result = await OrderService.updatePaymentStatus(
    userId,
    role,
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
    const { id: userId, role } = req.user as any;
    const result = await OrderService.searchFilterIncomingOrders(
      userId,
      role,
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
    const { id: userId, role } = req.user as any;
    const result = await OrderService.searchFilterOutgoingOrders(
      userId,
      role,
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

const verifyDeliveryOtp = catchAsync(async (req: Request, res: Response) => {
  const { id: userId, role } = req.user as any;
  const result = await OrderService.verifyDeliveryOtp(userId, role, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order delivered !!',
    data: result,
  });
});
const assigndForDelivery = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as any;

  const result = await OrderService.assignForDelivery(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Delivery assigned',
    data: result,
  });
});
const getMyOrderForDelivery = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.user as any;

    const result = await OrderService.getMyOrderForDelivery(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Order retrive',
      data: result,
    });
  },
);

export const OrderController = {
  getOrganizationOutgoingOrders,
  getOrganizationIncomingOrders,
  orderCreate,
  updateOrderStatus,
  updatePaymentStatus,
  getSingle,
  searchFilterIncomingOrders,
  searchFilterOutgoingOrders,
  verifyDeliveryOtp,
  assigndForDelivery,
  getMyOrderForDelivery,
};
