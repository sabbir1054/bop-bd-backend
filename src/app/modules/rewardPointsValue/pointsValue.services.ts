import httpStatus from 'http-status';
import prisma from '../../../shared/prisma';
import ApiError from '../../../errors/ApiError';

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

export const PointsValueServices = {
  createValueOfReward,
  getValueOfReward,
  editPointsValue,
  deletePointsValue,
};
