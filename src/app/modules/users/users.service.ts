import { User } from '@prisma/client';
import { Request } from 'express';
import fs from 'fs';
import httpStatus from 'http-status';
import path from 'path';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
const updateUserProfile = async (req: Request): Promise<User | null> => {
  const { id: userId } = req.user as any;

  const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not exist');
  }

  if (isUserExist.photo && req.body.photo !== isUserExist.photo) {
    // Delete the image file from the server
    const filePath = path.join(
      process.cwd(),
      'uploads/userPhoto',
      path.basename(isUserExist.photo),
    );
    fs.unlink(filePath, err => {
      if (err) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Failed to delete image: ${filePath}`,
        );
      }
    });
    const result = await prisma.user.update({
      where: { id: userId },
      data: {
        ...req.body,
      },
    });

    return result;
  } else {
    const result = await prisma.user.update({
      where: { id: userId },
      data: {
        ...req.body,
      },
    });

    return result;
  }
};

const removeProfilePicture = async (userId: string): Promise<User> => {
  const isUserExist = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not exist');
  }
  if (!isUserExist.photo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User has not any picture');
  }
  const filePath = path.join(
    process.cwd(),
    'uploads/userPhoto',
    path.basename(isUserExist.photo),
  );
  fs.unlink(filePath, err => {
    if (err) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Failed to delete image: ${filePath}`,
      );
    }
  });
  const result = await prisma.user.update({
    where: { id: userId },
    data: {
      photo: '',
    },
  });

  return result;
};

export const UserServices = {
  updateUserProfile,
  removeProfilePicture,
};
