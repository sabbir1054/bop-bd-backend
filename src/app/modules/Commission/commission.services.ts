import { Commission } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const createNew = async (payload: Commission): Promise<Commission> => {
  if (payload.commissionType === 'REFERRED_MEMBER') {
    if (!payload.ref_mem_validity) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Need referred member  commission validity day ',
      );
    }
  }

  const isExist = await prisma.commission.findFirst({
    where: {
      AND: [
        {
          commissionType: payload.commissionType,
          membershipCategory: payload.membershipCategory,
        },
      ],
    },
  });
  if (isExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You have already create it now you can update or delete',
    );
  }
  const result = await prisma.commission.create({
    data: payload,
  });
  return result;
};

const getAll = async (): Promise<Commission[]> => {
  const result = await prisma.commission.findMany({
    include: { referCodes: true },
  });
  return result;
};

const getSingle = async (id: string): Promise<Commission | null> => {
  const result = await prisma.commission.findUnique({
    where: { id },
    include: {
      referCodes: {
        include: {
          codeOwnerOrganization: true,
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
