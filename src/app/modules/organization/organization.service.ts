import { NextFunction, Request } from 'express';
import fs from 'fs';
import httpStatus from 'http-status';
import path from 'path';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { organizationSearchableFields } from './organization.constant';
import { IRangeOfDate, IupdateOrgaCategory } from './organization.interface';
const getDashboardMatrics = async (
  userId: string,
  userRole: string,
  orgId: string,
) => {
  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: {
        organization: true,
      },
    });
    if (!isValidStaff || !isValidStaff.isValidNow) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff info not found');
    }

    if (isValidStaff.organizationId !== orgId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'You cant see other organization info',
      );
    }
  }

  const result = await prisma.$transaction(async prisma => {
    // Total outgoing orders
    const totalOutgoingOrders = await prisma.order.count({
      where: { product_seller_id: orgId },
    });

    // Total incoming orders
    const totalIncomingOrders = await prisma.order.count({
      where: { customerId: orgId },
    });

    // Outgoing orders status count
    const outgoingOrdersStatus = await prisma.order.groupBy({
      by: ['orderStatus'],
      where: { product_seller_id: orgId },
      _count: { orderStatus: true },
    });
    // Outgoing payment status count
    const outgoingPaymentStatus = await prisma.order.groupBy({
      by: ['paymentStatus'],
      where: { product_seller_id: orgId },
      _count: { orderStatus: true },
    });

    // Incoming orders status count
    const incomingOrdersStatus = await prisma.order.groupBy({
      by: ['orderStatus'],
      where: { customerId: orgId },
      _count: { orderStatus: true },
    });
    // Incoming orders payment status count
    const incomingPaymentStatus = await prisma.order.groupBy({
      by: ['paymentStatus'],
      where: { customerId: orgId },
      _count: { orderStatus: true },
    });

    // Total cost from outgoing orders
    const totalCostOutgoingOrders = await prisma.order.aggregate({
      where: { product_seller_id: orgId },
      _sum: { total: true },
    });

    // Total earned from incoming orders
    const totalEarnedIncomingOrders = await prisma.order.aggregate({
      where: { customerId: orgId },
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
    if (!isValidStaff || !isValidStaff.isValidNow) {
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
    if (!isValidStaff || !isValidStaff.isValidNow) {
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
const updateOrganization = async (req: Request, next: NextFunction) => {
  const deletePhoto = (photoLink: string) => {
    // Delete the image file from the server
    const filePath = path.join(
      process.cwd(),
      'uploads/organizationPhoto',
      path.basename(photoLink),
    );
    fs.unlink(filePath, err => {
      if (err) {
        deletePhoto(req.body.photo);
        next(
          new ApiError(
            httpStatus.BAD_REQUEST,
            `Failed to delete previous image, try again for update,photo `,
          ),
        );
      }
    });
  };
  const { photo, name } = req.body;
  const { id: userId, role: userRole } = req.user as any;
  let orgId = null;
  if (userRole === 'STAFF') {
    const userInfo = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
    });
    if (!userInfo || !userInfo.isValidNow) {
      if (photo) {
        deletePhoto(photo);
      }

      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    const validStaff = ['STAFF_ADMIN'];
    if (!validStaff.includes(userInfo.role)) {
      if (photo) {
        deletePhoto(photo);
      }

      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only admin staff and owner can delete Payment options',
      );
    }
    orgId = userInfo.organizationId;
  } else {
    const userInfo = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userInfo) {
      if (photo) {
        deletePhoto(photo);
      }

      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }

    orgId = userInfo.organizationId;
  }
  if (!orgId) {
    if (photo) {
      deletePhoto(photo);
    }
    throw new ApiError(httpStatus.BAD_REQUEST, 'Organization info not found');
  }

  const isOrganizationExist = await prisma.organization.findUnique({
    where: { id: orgId },
  });
  if (!isOrganizationExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }
  if (isOrganizationExist.photo && photo) {
    deletePhoto(isOrganizationExist.photo);
  }

  if (photo && name) {
    const result = await prisma.organization.update({
      where: { id: orgId },
      data: {
        photo: photo,
        name: name,
      },
    });
    return result;
  } else {
    if (photo) {
      const result = await prisma.organization.update({
        where: { id: orgId },
        data: {
          photo: photo,
        },
      });
      return result;
    }

    if (name) {
      const result = await prisma.organization.update({
        where: { id: orgId },
        data: {
          name: name,
        },
      });
      return result;
    }
  }
};
const removePicture = async (
  userId: string,
  userRole: string,
  next: NextFunction,
) => {
  const deletePhoto = (photoLink: string) => {
    // Delete the image file from the server
    const filePath = path.join(
      process.cwd(),
      'uploads/organizationPhoto',
      path.basename(photoLink),
    );
    fs.unlink(filePath, err => {
      if (err) {
        next(
          new ApiError(
            httpStatus.BAD_REQUEST,
            `Failed to delete previous image, try again for update,photo `,
          ),
        );
      }
    });
  };

  let orgId = null;
  if (userRole === 'STAFF') {
    const userInfo = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
    });
    if (!userInfo || !userInfo.isValidNow) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    const validStaff = ['STAFF_ADMIN'];
    if (!validStaff.includes(userInfo.role)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only admin staff and owner can delete Payment options',
      );
    }
    orgId = userInfo.organizationId;
  } else {
    const userInfo = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }

    orgId = userInfo.organizationId;
  }
  if (!orgId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Organization info not found');
  }

  const isOrganizationExist = await prisma.organization.findUnique({
    where: { id: orgId },
  });
  if (!isOrganizationExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }
  if (isOrganizationExist.photo) {
    deletePhoto(isOrganizationExist.photo);
  }
  const result = await prisma.organization.update({
    where: { id: orgId },
    data: {
      photo: '',
    },
  });
  return result;
};

const updateOrganizationMembershipCategory = async (
  payload: IupdateOrgaCategory,
) => {
  const isExist = await prisma.organization.findUnique({
    where: { id: payload.organizationId },
  });
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }

  const result = await prisma.organization.update({
    where: { id: payload.organizationId },
    data: {
      memberShipCategory: payload.memberShipCategory,
    },
  });

  return result;
};

const suspendOrganization = async (orgId: string) => {
  const isExist = await prisma.organization.findUnique({
    where: { id: orgId },
  });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization not found');
  }

  const result = await prisma.organization.update({
    where: { id: orgId },
    data: {
      isSuspend: true,
    },
  });

  return result;
};

const getAllOrganization = async (
  filters: any,
  options: IPaginationOptions,
) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, businessTypeId, location, ...filtersData } = filters;
  const andConditions: any[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: organizationSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    const conditions = Object.entries(filtersData).map(([field, value]) => ({
      [field]: value,
    }));
    andConditions.push({ AND: conditions });
  }
  if (location) {
    andConditions.push({
      owner: {
        address: {
          contains: location,
          mode: 'insensitive',
        },
      },
    });
  }
  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.organization.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
    include: {
      owner: true,
    },
  });

  const total = await prisma.product.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getSingleOrganization = async (id: string) => {
  const isExist = await prisma.organization.findUnique({
    where: { id: id },
  });
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization not found');
  }
  const result = await prisma.organization.findUnique({
    where: { id: id },
    include: {
      products: {
        include: {
          category: true,
          images: true,
          feedbacks: true,
        },
      },
      owner: true,
      staff: { include: { staffInfo: true } },
      outgoing_order: true,
      incoming_order: true,
      ownerRefferedCode: true,
      PaymentSystemOptions: true,
      PayCommission: true,
      OrganizationRewardPoints: true,
      ClaimReward: true,
      RequestExtendDeadline: true,
    },
  });
  return result;
};

export const OrganizaionServices = {
  getDashboardMatrics,
  getOutgoingOrdersByDate,
  getIncomingOrdersByDate,
  updateOrganization,
  removePicture,
  suspendOrganization,
  updateOrganizationMembershipCategory,
  getAllOrganization,
  getSingleOrganization,
};
