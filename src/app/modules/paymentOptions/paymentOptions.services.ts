import { PaymentSystemOptions } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { IPaymentOptionPayload } from './paymentOptions.constant';

const createNew = async (
  userid: string,
  userRole: string,
  payload: IPaymentOptionPayload,
) => {
  let orgId = null;
  if (userRole === 'STAFF') {
    const userInfo = await prisma.staff.findUnique({
      where: { staffInfoId: userid },
    });
    if (!userInfo || !userInfo.isValidNow) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    const validStaff = ['STAFF_ADMIN', 'ACCOUNTS_MANAGER'];
    if (!validStaff.includes(userInfo.role)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only accounts manager and admin staff and owner can cerate Payment options',
      );
    }
    orgId = userInfo.organizationId;
  } else {
    const userInfo = await prisma.user.findUnique({
      where: { id: userid },
    });
    if (!userInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }

    orgId = userInfo.organizationId;
  }
  if (!orgId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Organization info not found');
  }

  const result = await prisma.paymentSystemOptions.create({
    data: {
      paymentCategory: payload.paymentCategory,
      methodName: payload.methodName,
      accountNumber: payload.accountNumber,
      description: payload.description,
      organizationId: orgId,
    },
  });
  return result;
};

const getSingle = async (organizationId: string) => {
  const result = await prisma.paymentSystemOptions.findMany({
    where: { organizationId: organizationId },
  });
  return result;
};

const updateSingle = async (
  userId: string,
  userRole: String,
  paymentOptionId: string,
  payload: Partial<PaymentSystemOptions>,
) => {
  let orgId = null;
  if (userRole === 'STAFF') {
    const userInfo = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
    });
    if (!userInfo || !userInfo.isValidNow) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    const validStaff = ['STAFF_ADMIN', 'ACCOUNTS_MANAGER'];
    if (!validStaff.includes(userInfo.role)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only accounts manager and admin staff and owner can change Payment options',
      );
    }
    orgId = userInfo.organizationId;
  } else {
    const userInfo = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }

    orgId = userInfo.organizationId;
  }
  if (!orgId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Organization info not found');
  }
  const isPaymentOptionsExist = await prisma.paymentSystemOptions.findUnique({
    where: { id: paymentOptionId },
  });
  if (!isPaymentOptionsExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment options not found');
  }
  if (orgId !== isPaymentOptionsExist.organizationId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization id not matched');
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
  let orgId = null;
  if (userRole === 'STAFF') {
    const userInfo = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
    });
    if (!userInfo || !userInfo.isValidNow) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    const validStaff = ['STAFF_ADMIN', 'ACCOUNTS_MANAGER'];
    if (!validStaff.includes(userInfo.role)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only accounts manager and admin staff and owner can delete Payment options',
      );
    }
    orgId = userInfo.organizationId;
  } else {
    const userInfo = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }

    orgId = userInfo.organizationId;
  }
  if (!orgId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Organization info not found');
  }
  const isPaymentOptionsExist = await prisma.paymentSystemOptions.findUnique({
    where: { id: paymentOptionId },
  });
  if (!isPaymentOptionsExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment options not found');
  }
  if (orgId !== isPaymentOptionsExist.organizationId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization id not matched');
  }
  const result = await prisma.paymentSystemOptions.delete({
    where: { id: paymentOptionId },
  });

  return result;
};

export const PaymentSystemOptionsService = {
  createNew,
  getSingle,
  updateSingle,
  deleteSingle,
};
