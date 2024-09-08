import { RewardPoints } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const createNew = async (payload: RewardPoints): Promise<RewardPoints> => {
  const isExist = await prisma.rewardPoints.findFirst({
    where: {
      AND: [
        {
          rewardType: payload.rewardType,
          membershipCategory: payload.membershipCategory,
        },
      ],
    },
  });
  if (isExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You have already create it now you can update or delete',
    );
  }

  const result = await prisma.rewardPoints.create({
    data: payload,
  });
  return result;
};

const getAll = async (): Promise<RewardPoints[]> => {
  const result = await prisma.rewardPoints.findMany({
    include: { organizationRewardPoints: true },
  });
  return result;
};

const getSingle = async (id: string): Promise<RewardPoints | null> => {
  const result = await prisma.rewardPoints.findUnique({
    where: { id },
    include: {
      organizationRewardPoints: {
        include: {
          organization: true,
        },
      },
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Reward info not found !');
  }

  return result;
};
const updateSingle = async (
  id: string,
  data: Partial<RewardPoints>,
): Promise<RewardPoints | null> => {
  const isExist = await prisma.rewardPoints.findUnique({ where: { id } });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Reward points not found !');
  }
  const result = await prisma.rewardPoints.update({ where: { id }, data });

  return result;
};

const deleteSingle = async (id: string): Promise<RewardPoints | null> => {
  const isExist = await prisma.rewardPoints.findUnique({ where: { id } });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Reward not found !');
  }
  const result = await prisma.rewardPoints.delete({ where: { id } });

  return result;
};

export const RewardServices = {
  createNew,
  getAll,
  getSingle,
  updateSingle,
  deleteSingle,
};
