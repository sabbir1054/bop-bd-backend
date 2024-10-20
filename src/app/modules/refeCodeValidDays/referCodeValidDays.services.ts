import { ValidityDays } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const createNew = async (payload: ValidityDays): Promise<ValidityDays> => {
  const isExist = await prisma.validityDays.findMany();
  if (isExist?.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Validity days already created ',
    );
  }
  const result = await prisma.validityDays.create({
    data: payload,
  });
  return result;
};

const getAll = async (): Promise<ValidityDays[]> => {
  const result = await prisma.validityDays.findMany();
  return result;
};

const updateSingle = async (
  data: Partial<ValidityDays>,
): Promise<ValidityDays | null> => {
  const isExist = await prisma.validityDays.findFirst();

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Validity days not found !');
  }
  const result = await prisma.validityDays.update({
    where: { id: isExist.id },
    data,
  });

  return result;
};

const deleteSingle = async (): Promise<ValidityDays | null> => {
  const isExist = await prisma.validityDays.findFirst();
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, '7>Business type not found !');
  }
  const result = await prisma.validityDays.delete({
    where: { id: isExist.id },
  });

  return result;
};

export const ReferCodeValidityServices = {
  createNew,
  getAll,
  updateSingle,
  deleteSingle,
};
