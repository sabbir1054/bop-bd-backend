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

export const AdminServices = {
  BOPCommissionInfo,
};
