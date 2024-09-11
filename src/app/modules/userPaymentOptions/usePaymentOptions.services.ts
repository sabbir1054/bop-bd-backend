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

export const UserPaymentOptionsService = {
  createPaymentOptions,
};
