import { DeadlinePayCommission } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const createNew = async (
  payload: DeadlinePayCommission,
): Promise<DeadlinePayCommission> => {
  const isExist = await prisma.deadlinePayCommission.findUnique({
    where: {
      memberCategory: payload.memberCategory,
    },
  });
  if (isExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Deadline for the member category alredyexist, now edit it',
    );
  }
  const result = await prisma.deadlinePayCommission.create({
    data: payload,
  });
  return result;
};

const getAll = async (): Promise<DeadlinePayCommission[]> => {
  const result = await prisma.deadlinePayCommission.findMany();
  return result;
};

const updateSingle = async (
  id: string,
  payload: Partial<DeadlinePayCommission>,
): Promise<DeadlinePayCommission | null> => {
  const isExist = await prisma.deadlinePayCommission.findMany({
    where: { id: id },
  });

  if (!isExist) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Deadline not found, create first !',
    );
  }

  const result = await prisma.deadlinePayCommission.update({
    where: { id: id },
    data: {
      ...payload,
    },
  });

  return result;
};

const deleteSingle = async (id: string) => {
  const isExist = await prisma.deadlinePayCommission.findMany({
    where: { id: id },
  });

  if (!isExist) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Deadline not found, create first !',
    );
  }

  const result = await prisma.deadlinePayCommission.delete({
    where: { id: id },
  });

  return result;
};
const getSingle = async (id: string) => {
  const result = await prisma.deadlinePayCommission.findMany({
    where: { id: id },
  });

  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Deadline not found, create first !',
    );
  }

  return result;
};

export const DeadlinePayCommissionServices = {
  createNew,
  getAll,
  updateSingle,
  deleteSingle,
  getSingle,
};
