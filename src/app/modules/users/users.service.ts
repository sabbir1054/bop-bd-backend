import { User } from '@prisma/client';
import { Request } from 'express';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const updateUserProfile = async (req: Request): Promise<User | null> => {
  const { id: userId } = req.user as any;

  const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not exist');
  }
  const result = await prisma.user.update({
    where: { id: userId },
    data: {
      ...req.body,
    },
  });

  return result;
};

export const UserServices = {
  updateUserProfile,
};
