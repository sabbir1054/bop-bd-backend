import { Role } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { chackSmsBalance } from '../../../helpers/smsBalanceCheck';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
const BOPCommissionInfo = async () => {
  const result = await prisma.$transaction(async prisma => {
    const totalCommission = await prisma.order_Commission_History.aggregate({
      _sum: {
        commissionAmount: true,
      },
    });

    const totalRecievedCommissionUsingCash =
      await prisma.payCommission.aggregate({
        _sum: { amount: true },
        where: {
          transactionDetails: {
            some: {
              statusMessage: 'Successful',
            },
          },
        },
      });
    const totaClaimedRewardAmount = await prisma.claimReward.aggregate({
      _sum: {
        claimedAmount: true,
      },
    });
    const totalPendingCommission = await prisma.organization.aggregate({
      _sum: {
        totalCommission: true,
      },
    });
    return {
      totalCommission: totalCommission,
      totalCommissionRecievedCash: totalRecievedCommissionUsingCash,
      totaClaimedRewardAmount: totaClaimedRewardAmount,
      totalPendingCommission: totalPendingCommission,
    };
  });

  return result;
};

const cashTransactionHistory = async (options: IPaginationOptions) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const result = await prisma.payCommission.findMany({
    where: {
      transactionDetails: {
        some: {
          statusMessage: 'Successful',
        },
      },
    },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      organization: true,
      transactionDetails: true,
    },
  });
  const total = await prisma.payCommission.count({
    where: {
      transactionDetails: {
        some: {
          statusMessage: 'Successful',
        },
      },
    },
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

const claimedRewardTransactionHistory = async (options: IPaginationOptions) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const result = await prisma.claimReward.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      oranization: true,
    },
  });
  const total = await prisma.claimReward.count({});
  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const BOPuserInfo = async () => {
  const result = await prisma.$transaction(async prisma => {
    const totalUsers = await prisma.user.count();
    const userCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });

    // Format the result for easier use
    const formattedCounts: Record<Role, number> = userCounts.reduce(
      (acc, { role, _count }) => {
        acc[role] = _count.role;
        return acc;
      },
      {} as Record<Role, number>,
    );
    const totalOrganizations = await prisma.organization.count();
    const totalUnverifiedOrganizations = await prisma.organization.count({
      where: { owner: { verified: false } },
    });
    const totalVerifiedOrganizations = await prisma.organization.count({
      where: { owner: { verified: true } },
    });

    return {
      totalUsers,
      usersCountByRole: formattedCounts,
      totalOrganizations,
      totalUnverifiedOrganizations,
      totalVerifiedOrganizations,
    };
  });

  return result;
};

const smsBalanceCheck = async () => {
  const result = await chackSmsBalance();
  return result;
};
const orderSearchableFields = ['id', 'orderCode'];
export const orderFilterableFieldsAdmin = ['searchTerm', 'orderStatus'];

const getAllOrders = async (filters: any, options: IPaginationOptions) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filtersData } = filters;
  const andConditions: any[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: orderSearchableFields.map(field => ({
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

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.order.findMany({
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
      customer: { include: { owner: true } },
      product_seller: { include: { owner: true } },
    },
  });

  const total = await prisma.order.count({
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
export const AdminServices = {
  BOPCommissionInfo,
  cashTransactionHistory,
  claimedRewardTransactionHistory,
  BOPuserInfo,
  smsBalanceCheck,
  getAllOrders,
};
