import { Commission } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const createNew = async (payload: Commission): Promise<Commission> => {
  const result = await prisma.commission.create({
    data: payload,
  });
  return result;
};

const getAll = async (): Promise<Commission[]> => {
  const result = await prisma.commission.findMany();
  return result;
};

const getSingle = async (id: string): Promise<Commission | null> => {
  const result = await prisma.commission.findUnique({
    where: { id },
    include: {
      referCodes: {
        include: {
          codeOwnerOrganization: true,
          codeUsedOrganization: true,
        },
      },
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Commission info not found !');
  }

  return result;
};
const updateSingle = async (
  id: string,
  data: Partial<Commission>,
): Promise<Commission | null> => {
  const isExist = await prisma.commission.findUnique({ where: { id } });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Commission not found !');
  }
  const result = await prisma.commission.update({ where: { id }, data });

  return result;
};

const deleteSingle = async (id: string): Promise<Commission | null> => {
  const isExist = await prisma.commission.findUnique({ where: { id } });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Commission not found !');
  }
  const result = await prisma.commission.delete({ where: { id } });

  return result;
};

export const CommissionServices = {
  createNew,
  getAll,
  getSingle,
  updateSingle,
  deleteSingle,
};
