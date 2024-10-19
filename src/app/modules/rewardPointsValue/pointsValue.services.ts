import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const getValueOfReward = async () => {
  const result = await prisma.pointsValue.findMany();
  if (result?.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Value of points are not created',
    );
  }
  return result;
};
const createValueOfReward = async (perPointsTk: number) => {
  const isExist = await prisma.pointsValue.findMany();
  if (isExist?.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Value of points already created',
    );
  }
  const result = await prisma.pointsValue.create({ data: { perPointsTk } });
  return result;
};

const editPointsValue = async (perPointsTk: number) => {
  const isExist = await prisma.pointsValue.findMany();
  if (isExist?.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Value of points already created',
    );
  }
  const result = await prisma.pointsValue.update({
    where: { id: isExist[0].id },
    data: { perPointsTk },
  });
  return result;
};
const deletePointsValue = async () => {
  const isExist = await prisma.pointsValue.findMany();
  if (isExist?.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Value of points already created',
    );
  }
  const result = await prisma.pointsValue.delete({
    where: { id: isExist[0].id },
  });
  return result;
};

const myTotalRewardValue = async (userId: string, role: string) => {
  let orgId = null;

  if (role === 'STAFF') {
    const isUserExist = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { organization: true },
    });
    if (!isUserExist) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    orgId = isUserExist.organizationId;
  } else {
    const isUserExist = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });
    if (!isUserExist) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    orgId = isUserExist.organizationId;
  }
  if (!orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization not found');
  }
  const result = await prisma.$transaction(async prisma => {
    const currentPointsValue = await prisma.pointsValue.findFirst({});
    if (!currentPointsValue) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Points value not set');
    }
    const ogranizationInfo = await prisma.organization.findUnique({
      where: { id: orgId },
    });
    if (!ogranizationInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Organization not found');
    }
    const calculatedPointsToValue = ogranizationInfo.totalRewardPoints;
  });
};

export const PointsValueServices = {
  createValueOfReward,
  getValueOfReward,
  editPointsValue,
  deletePointsValue,
};
