import { User } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const getAll = async (userId: string): Promise<User[]> => {
  const andConditions: any[] = [];
  const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not valid');
  }
  const organizationId = isUserExist.organizationId;

  andConditions.push({ organizationId: organizationId });
  andConditions.push({ role: 'STAFF' });

  const result = await prisma.user.findMany({
    where: { AND: andConditions },
    include: {
      Staff: true,
    },
  });
  return result;
};
const getSingle = async (
  userId: string,
  staffUserId: string,
): Promise<User> => {
  const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not valid');
  }
  const organizationId = isUserExist.organizationId;

  const result = await prisma.user.findUnique({
    where: { id: staffUserId },
    include: { Staff: true },
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Staff not found');
  }
  return result;
};

export const staffServices = {
  getAll,
  getSingle,
};
