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
