import { PaymentSystemOptions } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { ICreatePaymentOptions } from './userPaymentOptions.constant';

const createPaymentOptions = async (
  userId: string,
  role: string,
  payload: ICreatePaymentOptions,
) => {
  let orgId = null;
  if (role === 'STAFF') {
    const validStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
    });
    if (!validStaff || validStaff.role !== 'STAFF_ADMIN') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid staff role');
    }
    orgId = validStaff.organizationId;
  } else {
    const userInfo = await prisma.user.findUnique({ where: { id: userId } });
    if (!userInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    orgId = userInfo.organizationId;
  }

  if (!orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }

  if (payload.paymentCategory === 'CASH_ON_DELIVERY') {
    const result = await prisma.paymentSystemOptions.create({
      data: { organizationId: orgId, ...payload },
    });

    return result;
  } else {
    if (
      payload.paymentCategory === 'BANK_TRANSACTION' &&
      !payload.descripption
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Bank information: BRANCH NAME, ADDRESS. ACCOUNT NUMBER REQUIRED',
      );
    }

    if (
      payload.paymentCategory === 'MOBILE_BANKING' &&
      !payload.accountNumber
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Give information:ACCOUNT NUMBER REQUIRED',
      );
    }

    const result = await prisma.paymentSystemOptions.create({
      data: { organizationId: orgId, ...payload },
    });

    return result;
  }
};
const organizationAllPaymentOptions = async (organizationId: string) => {
  const result = await prisma.paymentSystemOptions.findMany({
    where: { organizationId: organizationId },
    include: {
      organization: true,
    },
  });

  return result;
};
const updateorganizationPaymentOptions = async (
  userId: string,
  role: string,
  organizationId: string,
  paymentSystemOptionsId: string,
  payload: Partial<PaymentSystemOptions>,
) => {
  let orgId = null;
  if (role === 'STAFF') {
    const validStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
    });
    if (!validStaff || validStaff.role !== 'STAFF_ADMIN') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid staff role');
    }
    orgId = validStaff.organizationId;
  } else {
    const userInfo = await prisma.user.findUnique({ where: { id: userId } });
    if (!userInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    orgId = userInfo.organizationId;
  }

  if (!orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }
  if (orgId !== organizationId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Your organization id not matched',
    );
  }
  const isOrganizationExist = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!isOrganizationExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization not found');
  }

  const isPaymentOptionsExist = await prisma.paymentSystemOptions.findUnique({
    where: { id: paymentSystemOptionsId },
    include: {
      organization: true,
    },
  });

  if (!isPaymentOptionsExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment options not found');
  }
  if (isPaymentOptionsExist.organizationId !== organizationId) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Paymentoptions id not contains in your organization',
    );
  }
  const result = await prisma.paymentSystemOptions.update({
    where: { id: paymentSystemOptionsId },
    data: { ...payload },
  });

  return result;
};
const deleteorganizationPaymentOptions = async (
  userId: string,
  role: string,
  organizationId: string,
  paymentSystemOptionsId: string,
) => {
  let orgId = null;
  if (role === 'STAFF') {
    const validStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
    });
    if (!validStaff || validStaff.role !== 'STAFF_ADMIN') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid staff role');
    }
    orgId = validStaff.organizationId;
  } else {
    const userInfo = await prisma.user.findUnique({ where: { id: userId } });
    if (!userInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    orgId = userInfo.organizationId;
  }

  if (!orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }
  if (orgId !== organizationId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Your organization id not matched',
    );
  }
  const isOrganizationExist = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!isOrganizationExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization not found');
  }

  const isPaymentOptionsExist = await prisma.paymentSystemOptions.findUnique({
    where: { id: paymentSystemOptionsId },
    include: {
      organization: true,
    },
  });

  if (!isPaymentOptionsExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment options not found');
  }
  if (isPaymentOptionsExist.organizationId !== organizationId) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Paymentoptions id not contains in your organization',
    );
  }
  const result = await prisma.paymentSystemOptions.delete({
    where: { id: paymentSystemOptionsId },
  });

  return result;
};

export const UserPaymentOptionsService = {
  createPaymentOptions,
  organizationAllPaymentOptions,
  updateorganizationPaymentOptions,
  deleteorganizationPaymentOptions,
};
