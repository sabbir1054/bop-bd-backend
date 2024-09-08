import { PaymentSystemOptions } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const createNew = async (
  userid: string,
  userRole: string,
  payload: PaymentSystemOptions,
) => {
  if (userRole === 'STAFF') {
    const userInfo = await prisma.staff.findUnique({
      where: { staffInfoId: userid },
    });
    if (!userInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    const validStaff = ['STAFF_ADMIN', 'ACCOUNTS_MANAGER'];
    if (!validStaff.includes(userInfo.role)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only accounts manager and admin staff and owner can cerate Payment options',
      );
    }
  }

  const organizationInfo = await prisma.organization.findUnique({
    where: { ownerId: userid },
    include: {
      owner: true,
    },
  });
  if (!organizationInfo?.owner?.verified) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Your organization is not verified',
    );
  }
  const result = await prisma.paymentSystemOptions.create({ data: payload });
  return result;
};

const getAll = async (userId: string, payload: PaymentSystemOptions) => {
  const organizationinfo = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: { include: { BusinessType: true } } },
  });

  if (!organizationinfo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }

  const result = await prisma.paymentSystemOptions.create({
    data: payload,
    include: {
      organization: { include: { BusinessType: true } },
    },
  });
  return result;
};

const getSingle = async (paymentOptionId: string) => {
  const result = await prisma.paymentSystemOptions.findUnique({
    where: { id: paymentOptionId },
    include: {
      organization: { include: { BusinessType: true, owner: true } },
    },
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Referred code not found');
  }
};

const updateSingle = async (
  userId: string,
  userRole: String,
  paymentOptionId: string,
  payload: Partial<PaymentSystemOptions>,
) => {
  if (userRole === 'STAFF') {
    const userInfo = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
    });
    if (!userInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    const validStaff = ['STAFF_ADMIN', 'ACCOUNTS_MANAGER'];
    if (!validStaff.includes(userInfo.role)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only accounts manager and admin staff and owner can change Payment options',
      );
    }
  }
  const result = await prisma.paymentSystemOptions.update({
    where: { id: paymentOptionId },
    data: payload,
  });

  return result;
};

const deleteSingle = async (
  userId: string,
  userRole: string,
  paymentOptionId: string,
) => {
  if (userRole === 'STAFF') {
    const userInfo = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
    });
    if (!userInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    const validStaff = ['STAFF_ADMIN', 'ACCOUNTS_MANAGER'];
    if (!validStaff.includes(userInfo.role)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only accounts manager and admin staff and owner can change Payment options',
      );
    }
  }
  const result = await prisma.paymentSystemOptions.delete({
    where: { id: paymentOptionId },
  });

  return result;
};

export const PaymentSystemOptionsService = {
  createNew,
  getAll,
  getSingle,
  updateSingle,
  deleteSingle,
};
