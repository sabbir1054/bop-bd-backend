import { RefferedCode } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const createNew = async (userid: string, payload: RefferedCode) => {
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
  const result = await prisma.refferedCode.create({ data: payload });
  return result;
};

const getAll = async (userId: string, userRole: string) => {
  if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
    const result = await prisma.refferedCode.findMany({
      include: { commission: true, codeOwnerOrganization: true },
    });
    return result;
  } else {
    const userInfo = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });
    if (!userInfo || !userInfo.organizationId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    const result = await prisma.refferedCode.findMany({
      where: { codeOwnerorganizationId: userInfo.organizationId },
    });
    return result;
  }
};

const getSingle = async (referredCodeId: string) => {
  const result = await prisma.refferedCode.findUnique({
    where: { id: referredCodeId },
    include: {
      commission: true,
      codeOwnerOrganization: true,
    },
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Referred code not found');
  }
};

const updateSingle = async (
  referredCodeId: string,
  payload: Partial<RefferedCode>,
) => {
  const isExist = await prisma.refferedCode.findUnique({
    where: { id: referredCodeId },
  });
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Referred code not found');
  }
  const result = await prisma.refferedCode.update({
    where: { id: referredCodeId },
    data: { ...payload },
  });
};

const deleteSingle = async (referredCodeId: string) => {
  const isExist = await prisma.refferedCode.findUnique({
    where: { id: referredCodeId },
  });
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Referred code not found');
  }
  const result = await prisma.refferedCode.delete({
    where: { id: referredCodeId },
  });
};

export const ReferredCodeService = {
  createNew,
  getAll,
  getSingle,
  updateSingle,
  deleteSingle,
};
