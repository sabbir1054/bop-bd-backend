import { DeadlinePayCommission } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { IHandleDeadlineRequest } from './deadlineCommisssionPay.interface';

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

const extendDeadlineRequest = async (
  userId: string,
  userRole: string,
  comment: string,
) => {
  let orgId = null;
  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
    });

    if (!isValidStaff || !isValidStaff.isValidNow) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid staff user id');
    }

    if (isValidStaff.role !== 'STAFF_ADMIN') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'You are not able to request');
    }

    orgId = isValidStaff.organizationId;
  } else {
    const userInfo = await prisma.user.findUnique({ where: { id: userId } });
    if (!userInfo) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user  id');
    }
    orgId = userInfo.organizationId;
  }

  if (!orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }

  const result = await prisma.requestExtendDeadline.create({
    data: { organizationId: orgId, comment: comment },
  });
  return result;
};

const handleDeadlineRequest = async (payload: IHandleDeadlineRequest) => {
  const isRequestExist = await prisma.requestExtendDeadline.findUnique({
    where: { id: payload.requestId },
  });

  if (!isRequestExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request is not found');
  }
  const result = await prisma.$transaction(async prisma => {
    const handlerequest = await prisma.requestExtendDeadline.update({
      where: { id: payload.requestId },
      data: {
        requestStatus: payload.updatedStatus,
      },
    });
    const updateExtendDays = await prisma.organization.update({
      where: { id: isRequestExist.organizationId },
      data: {
        deadlineExtendfor: payload.extendDays,
      },
    });

    return {
      ...handleDeadlineRequest,
      extededDays: updateExtendDays.deadlineExtendfor,
    };
  });
  return result;
};

export const DeadlinePayCommissionServices = {
  createNew,
  getAll,
  updateSingle,
  deleteSingle,
  getSingle,
  extendDeadlineRequest,
};
