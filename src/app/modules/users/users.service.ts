import { User } from '@prisma/client';
import { NextFunction, Request } from 'express';
import fs from 'fs';
import httpStatus from 'http-status';
import path from 'path';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
const updateUserProfile = async (
  req: Request,
  next: NextFunction,
): Promise<Partial<User> | null> => {
  const { id: userId } = req.user as any;

  const deletePhoto = (photoLink: string) => {
    // Delete the image file from the server
    const filePath = path.join(
      process.cwd(),
      'uploads/userPhoto',
      path.basename(photoLink),
    );
    fs.unlink(filePath, err => {
      if (err) {
        deletePhoto(req.body.photo);
        next(
          new ApiError(
            httpStatus.BAD_REQUEST,
            `Failed to delete previous image, try again for update,photo `,
          ),
        );
      }
    });
  };

  const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
  if (!isUserExist) {
    //* delete uploaded photo
    deletePhoto(req.body.photo);
    throw new ApiError(httpStatus.NOT_FOUND, 'User not exist');
  }
  //* make updated data
  const { businessTypeId, ...others } = req.body;
  const updatedData = others;

  if (businessTypeId) {
    updatedData.businessType = { connect: { id: businessTypeId } };
  }

  if (isUserExist.photo && req.body.photo !== isUserExist.photo) {
    //* delete photo
    if (req.body.photo) {
      deletePhoto(isUserExist?.photo);
    }
    const result = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updatedData,
      },
      select: {
        id: true,
        role: true,
        memberCategory: true,
        verified: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        photo: true,
        license: true,
        nid: true,
        shop_name: true,
        createdAt: true,
        updatedAt: true,
        feedbacks: true,
        cart: true,
        products: true,
        outgoing_order: true,
        incoming_order: true,
        businessType: true,
        businessTypeId: true,
      },
    });

    return result;
  } else {
    const result = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updatedData,
      },
      select: {
        id: true,
        role: true,
        memberCategory: true,
        verified: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        photo: true,
        license: true,
        nid: true,
        shop_name: true,
        createdAt: true,
        updatedAt: true,
        feedbacks: true,
        cart: true,
        products: true,
        outgoing_order: true,
        incoming_order: true,
        businessType: true,
        businessTypeId: true,
      },
    });

    return result;
  }
};

const removeProfilePicture = async (userId: string): Promise<Partial<User>> => {
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
    select: {
      id: true,
      role: true,
      memberCategory: true,
      verified: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      photo: true,
      license: true,
      nid: true,
      shop_name: true,
      createdAt: true,
      updatedAt: true,
      feedbacks: true,
      cart: true,
      products: true,
      outgoing_order: true,
      incoming_order: true,
      businessType: true,
      businessTypeId: true,
    },
  });

  return result;
};

const getAll = async (): Promise<Partial<User>[]> => {
  const result = await prisma.user.findMany({
    select: {
      id: true,
      role: true,
      memberCategory: true,
      verified: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      photo: true,
      license: true,
      nid: true,
      shop_name: true,
      createdAt: true,
      updatedAt: true,
      businessType: true,
      businessTypeId: true,
    },
  });
  return result;
};

const getSingle = async (
  userId: string,
  profileId: string,
  role: string,
): Promise<User | null> => {
  let result = await prisma.user.findUnique({
    where: { id: profileId },
    include: {
      feedbacks: true,
      cart: {
        include: {
          CartItem: true,
        },
      },
      products: true,
      outgoing_order: {
        include: { orderItems: true },
      },
      incoming_order: {
        include: { orderItems: true },
      },
      businessType: true,
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found !');
  }
  result.password = '';

  if (role === ('ADMIN' || 'SUPER_ADMIN')) {
    return result;
  } else {
    if (userId !== result.id) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'You can only see you profile',
      );
    } else {
      return result;
    }
  }
};

const deleteUnverifiedOtp = async (phone: string) => {
  const isUserExist = await prisma.user.findUnique({ where: { phone: phone } });
  const isOtpCreate = await prisma.oneTimePassword.findUnique({
    where: { phone: phone },
  });
  if (isUserExist?.isMobileVerified) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'User is verified. Please contact with admin for delete',
    );
  }
  const result = await prisma.$transaction(async prisma => {
    if (isUserExist && isOtpCreate) {
      await prisma.user.delete({ where: { phone: phone } });
      await prisma.oneTimePassword.delete({ where: { phone: phone } });
    } else {
      if (isUserExist) {
        await prisma.user.delete({ where: { phone: phone } });
      }

      if (isOtpCreate) {
        await prisma.oneTimePassword.delete({ where: { phone: phone } });
      }
    }

    return 'Delete user';
  });

  return result;
};

export const UserServices = {
  updateUserProfile,
  removeProfilePicture,
  getAll,
  getSingle,
  deleteUnverifiedOtp,
};
