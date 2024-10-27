import { paginationHelpers } from '../../../helpers/paginationHelper';
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
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      organization: true,
      transactionDetails: true,
    },
  });
  const total = await prisma.payCommission.count({});
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

export const AdminServices = {
  BOPCommissionInfo,
  cashTransactionHistory,
  claimedRewardTransactionHistory,
};
