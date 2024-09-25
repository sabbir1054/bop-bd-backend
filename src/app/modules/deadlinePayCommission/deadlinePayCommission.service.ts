import { DeadlinePayCommission } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const createNew = async (
  payload: DeadlinePayCommission,
): Promise<DeadlinePayCommission> => {
  const isExist = await prisma.deadlinePayCommission.findMany();
  if (isExist.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Date already create now edit it',
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
  deadline: string,
): Promise<DeadlinePayCommission | null> => {
  const isExist = await prisma.deadlinePayCommission.findMany();

  if (isExist.length === 0) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Deadline not found, create first !',
    );
  }
  if (!isExist[0]) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Deadline not found, create first !',
    );
  }
  const result = await prisma.deadlinePayCommission.update({
    where: { id: isExist[0].id },
    data: {
      deadline: deadline,
    },
  });

  return result;
};

const deleteSingle = async () => {
  const isExist = await prisma.deadlinePayCommission.findMany();

  if (isExist.length === 0) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Deadline not found, create first !',
    );
  }
  if (!isExist[0]) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Deadline not found, create first !',
    );
  }
  const result = await prisma.deadlinePayCommission.delete({
    where: { id: isExist[0].id },
  });

  return result;
};

export const DeadlinePayCommissionServices = {
  createNew,
  getAll,
  updateSingle,
  deleteSingle,
};
