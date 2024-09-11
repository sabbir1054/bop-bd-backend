import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { IRangeOfDate } from './organization.interface';

const getDashboardMatrics = async (userId: string, userRole: string) => {
  let ownerId = null;

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: {
        organization: true,
      },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff info not found');
    }
    if (isValidStaff.role !== 'STAFF_ADMIN') {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff role not valid');
    }
    ownerId = isValidStaff.organization.ownerId;
  } else {
    ownerId = userId;
  }

  if (!ownerId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Owner info not found');
  }
  const result = await prisma.$transaction(async prisma => {
    // Total outgoing orders
    const totalOutgoingOrders = await prisma.order.count({
      where: { product_seller_id: userId },
    });

    // Total incoming orders
    const totalIncomingOrders = await prisma.order.count({
      where: { customerId: userId },
    });

    // Outgoing orders status count
    const outgoingOrdersStatus = await prisma.order.groupBy({
      by: ['orderStatus'],
      where: { product_seller_id: userId },
      _count: { orderStatus: true },
    });
    // Outgoing payment status count
    const outgoingPaymentStatus = await prisma.order.groupBy({
      by: ['paymentStatus'],
      where: { product_seller_id: userId },
      _count: { orderStatus: true },
    });

    // Incoming orders status count
    const incomingOrdersStatus = await prisma.order.groupBy({
      by: ['orderStatus'],
      where: { customerId: userId },
      _count: { orderStatus: true },
    });
    // Incoming orders payment status count
    const incomingPaymentStatus = await prisma.order.groupBy({
      by: ['paymentStatus'],
      where: { customerId: userId },
      _count: { orderStatus: true },
    });

    // Total cost from outgoing orders
    const totalCostOutgoingOrders = await prisma.order.aggregate({
      where: { product_seller_id: userId },
      _sum: { total: true },
    });

    // Total earned from incoming orders
    const totalEarnedIncomingOrders = await prisma.order.aggregate({
      where: { customerId: userId },
      _sum: { total: true },
    });

    return {
      totalOutgoingOrders,
      totalIncomingOrders,
      outgoingOrdersStatus,
      incomingOrdersStatus,
      outgoingPaymentStatus,
      incomingPaymentStatus,
      totalCostOutgoingOrders: totalCostOutgoingOrders._sum.total,
      totalEarnedIncomingOrders: totalEarnedIncomingOrders._sum.total,
    };
  });
  return result;
};
const getOutgoingOrdersByDate = async (
  userId: string,
  userRole: string,
  date: IRangeOfDate,
) => {
  // formate date
  const start = new Date(date.startDate);
  const end = new Date(date.endDate);
  let ownerId = null;

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: {
        organization: true,
      },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff info not found');
    }
    const validStaffRole = ['STAFF_ADMIN', 'ACCOUNTS_MANAGER'];
    if (!validStaffRole.includes(isValidStaff.role)) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff role not valid');
    }
    ownerId = isValidStaff.organization.ownerId;
  } else {
    ownerId = userId;
  }

  if (!ownerId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Owner info not found');
  }
  const result = await prisma.$transaction(async prisma => {
    // Total outgoing orders within date range
    const outgoingOrders = await prisma.order.findMany({
      where: {
        customerId: ownerId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });
    // Total cost from outgoing orders within date range
    const totalCostOutgoingOrders = await prisma.order.aggregate({
      where: {
        customerId: ownerId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _sum: { total: true },
    });
    return {
      outgoingOrders: outgoingOrders,
      outgoingOrderCost: totalCostOutgoingOrders,
      date: date,
    };
  });
};
const getIncomingOrdersByDate = async (
  userId: string,
  userRole: string,
  date: IRangeOfDate,
) => {
  // formate date
  const start = new Date(date.startDate);
  const end = new Date(date.endDate);
  let ownerId = null;

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: {
        organization: true,
      },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff info not found');
    }
    const validStaffRole = ['STAFF_ADMIN', 'ACCOUNTS_MANAGER'];
    if (!validStaffRole.includes(isValidStaff.role)) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff role not valid');
    }
    ownerId = isValidStaff.organization.ownerId;
  } else {
    ownerId = userId;
  }

  if (!ownerId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Owner info not found');
  }
  const result = await prisma.$transaction(async prisma => {
    // Total outgoing orders within date range
    const incomingOrders = await prisma.order.findMany({
      where: {
        product_seller_id: ownerId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });
    // Total cost from outgoing orders within date range
    const totalEarnIncomingOrders = await prisma.order.aggregate({
      where: {
        product_seller_id: ownerId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _sum: { total: true },
    });
    return {
      incomingOrders: incomingOrders,
      incomingOrderEarning: totalEarnIncomingOrders,
      date: date,
    };
  });
};

export const OrganizaionServices = {
  getDashboardMatrics,
  getOutgoingOrdersByDate,
  getIncomingOrdersByDate,
};
