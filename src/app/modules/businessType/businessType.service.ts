import { BusinessType, Category } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const createNew = async (payload: BusinessType): Promise<BusinessType> => {
  const result = await prisma.businessType.create({
    data: payload,
  });
  return result;
};

const getAll = async (): Promise<BusinessType[]> => {
  const result = await prisma.businessType.findMany();
  return result;
};

const getSingle = async (id: string): Promise<BusinessType | null> => {
  const result = await prisma.businessType.findUnique({
    where: { id },
    include: {
      category: true,
      user: true,
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Business type not found !');
  }

  return result;
};
const updateSingle = async (
  id: string,
  data: Partial<BusinessType>,
): Promise<BusinessType | null> => {
  const isExist = await prisma.businessType.findUnique({ where: { id } });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Business type not found !');
  }
  const result = await prisma.businessType.update({ where: { id }, data });

  return result;
};

const deleteSingle = async (id: string): Promise<BusinessType | null> => {
  const isExist = await prisma.businessType.findUnique({ where: { id } });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Business type not found !');
  }
  const result = await prisma.businessType.delete({ where: { id } });

  return result;
};

const getAllProductBusinessType = async (id: string): Promise<Category[]> => {
  const isBusinessTypeExist = await prisma.businessType.findUnique({
    where: { id: id },
    include: {
      category: {
        include: {
          products: {
            include: {
              images: true,
              owner: {
                select: {
                  id: true,
                  role: true,
                  memberCategory: true,
                  verified: true,
                  name: true,
                  email: true,
                  phone: true,
                  address: true,
                  photo: true,
                  license: true,
                  nid: true,
                  shop_name: true,
                  createdAt: true,
                  updatedAt: true,
                  businessType: true,
                  businessTypeId: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!isBusinessTypeExist) {
    throw new ApiError(httpStatus.NOT_FOUND, ' Business type not found !');
  }
  const result = isBusinessTypeExist.category;
  return result;
};

export const BusinessTypeServices = {
  createNew,
  getAll,
  getSingle,
  updateSingle,
  deleteSingle,
  getAllProductBusinessType,
};
