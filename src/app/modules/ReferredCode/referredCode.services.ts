import { RefferedCode } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { generateReferralCode } from '../../../helpers/referredCodeGenaretor';
import prisma from '../../../shared/prisma';
import { IReferredCode } from './referredCode.constant';

const createNew = async (
  userid: string,
  role: string,
  payload: IReferredCode,
) => {
  if (role === 'STAFF') {
    const validStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userid },
    });

    if (!validStaff || validStaff.role !== 'STAFF_ADMIN') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid staff role');
    }
    const organizationInfo = await prisma.organization.findUnique({
      where: { id: validStaff.organizationId },
      include: {
        owner: true,
        ownerRefferedCode: true,
      },
    });
    if (!organizationInfo?.owner?.verified) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Your organization is not verified',
      );
    }
  }
  const result = await prisma.$transaction(async prisma => {
    const organizationInfo = await prisma.user.findUnique({
      where: { id: userid },
      include: {
        organization: {
          include: {
            owner: true,
            ownerRefferedCode: true,
          },
        },
      },
    });
    if (!organizationInfo?.organization?.owner?.verified) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Your organization is not verified',
      );
    }

    if (
      organizationInfo.organization.ownerRefferedCode.filter(
        code => code.isValid === true,
      ).length > 0
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'You have already an active refer code',
      );
    }

    let referCode = generateReferralCode();

    const isExist = await prisma.refferedCode.findUnique({
      where: { code: referCode },
    });

    if (isExist) {
      referCode = generateReferralCode();
    } else {
      const joiningRewardInfo = await prisma.rewardPoints.findFirst({
        where: {
          AND: [
            {
              membershipCategory:
                organizationInfo.organization.memberShipCategory,
            },
            {
              rewardType: 'JOINING',
            },
          ],
        },
      });
      if (!joiningRewardInfo) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          'Joining Reward info not found',
        );
      }
      const buyingRewardInfo = await prisma.rewardPoints.findFirst({
        where: {
          AND: [
            {
              membershipCategory:
                organizationInfo.organization.memberShipCategory,
            },
            {
              rewardType: 'BUYING',
            },
          ],
        },
      });
      if (!buyingRewardInfo) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          'Buying Reward info not found',
        );
      }

      //* get the validity day

      const validityDay = await prisma.validityDays.findFirst();

      if (!validityDay) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Validity day info not found');
      }

      const commission = await prisma.commission.findFirst({
        where: {
          AND: [
            { commissionType: 'REFERRED_MEMBER' },
            {
              membershipCategory:
                organizationInfo.organization.memberShipCategory,
            },
          ],
        },
      });

      if (!commission) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Commission info not found');
      }
      //* make date
      const validUntilDate = new Date();
      validUntilDate.setDate(validUntilDate.getDate() + validityDay.validDays);
      const newData = {
        code: referCode,
        validUntil: validUntilDate,
        isValid: true,
        commissionId: commission.id,
        codeOwnerorganizationId: payload.codeOwnerorganizationId,
        joiningRewardPointsId: joiningRewardInfo?.id,
        buyingRewardPointsId: buyingRewardInfo?.id,
      };
      if (!newData.code) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Code not genaret');
      }
      if (!newData.buyingRewardPointsId || !newData.joiningRewardPointsId) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Reward info not found');
      }
      const result = await prisma.refferedCode.create({
        data: newData,
      });
      return result;
    }
  });
  return result;
};

const getAll = async (userId: string, userRole: string) => {
  if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
    const result = await prisma.refferedCode.findMany({
      include: {
        commission: true,
        codeOwnerOrganization: true,
        joiningRewardPoints: true,
        buyingRewardPoints: true,
        organizationUsedReffereCode: true,
      },
    });
    return result;
  } else {
    const userInfo = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });
    if (!userInfo || !userInfo.organizationId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    const result = await prisma.refferedCode.findMany({
      where: { codeOwnerorganizationId: userInfo.organizationId },
      include: {
        commission: true,
        codeOwnerOrganization: true,
        joiningRewardPoints: true,
        buyingRewardPoints: true,
        organizationUsedReffereCode: true,
      },
    });
    return result;
  }
};

const getSingle = async (referredCodeId: string) => {
  const result = await prisma.refferedCode.findUnique({
    where: { id: referredCodeId },
    include: {
      commission: true,
      codeOwnerOrganization: true,
    },
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Referred code not found');
  }
  return result;
};

const updateSingle = async (
  referredCodeId: string,
  payload: Partial<RefferedCode>,
) => {
  const isExist = await prisma.refferedCode.findUnique({
    where: { id: referredCodeId },
  });
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Referred code not found');
  }
  const result = await prisma.refferedCode.update({
    where: { id: referredCodeId },
    data: { ...payload },
  });
};

const deleteSingle = async (referredCodeId: string) => {
  const isExist = await prisma.refferedCode.findUnique({
    where: { id: referredCodeId },
  });
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Referred code not found');
  }
  const result = await prisma.refferedCode.delete({
    where: { id: referredCodeId },
  });
};

export const ReferredCodeService = {
  createNew,
  getAll,
  getSingle,
  updateSingle,
  deleteSingle,
};
