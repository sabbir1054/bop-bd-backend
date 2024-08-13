import { Category } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}
const createNew = async (req: any): Promise<Category> => {
  const { businessTypeId, eng_name, bn_name, photo } = req.body;
  const isBusinessTypeExist = await prisma.businessType.findUnique({
    where: { id: businessTypeId },
  });
  if (!isBusinessTypeExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Business type not found !');
  }

  const result = await prisma.category.create({
    data: {
      photo: photo ? photo : '',
      eng_name: eng_name,
      bn_name: bn_name,
      businessType: { connect: { id: businessTypeId } },
    },
  });
  return result;
};
/* const createNew = async (payload: Category): Promise<Category> => {
  const isBusinessTypeExist = await prisma.businessType.findUnique({
    where: { id: payload.businessTypeId },
  });
  if (!isBusinessTypeExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Business type not found !');
  }

  const result = await prisma.category.create({
    data: {
      eng_name: payload.eng_name,
      bn_name: payload.bn_name,
      businessType: { connect: { id: payload.businessTypeId } },
    },
  });
  return result;
}; */

const getAll = async (): Promise<Category[]> => {
  const result = await prisma.category.findMany({
    include: { businessType: true },
  });
  return result;
};

const getSingle = async (id: string): Promise<Category | null> => {
  const result = await prisma.category.findUnique({
    where: { id },
    include: { businessType: true },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found !');
  }

  return result;
};
const updateSingle = async (
  id: string,
  data: Partial<Category>,
): Promise<Category | null> => {
  const { businessTypeId, ...othersData } = data;
  const isExist = await prisma.category.findUnique({ where: { id } });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found !');
  }

  const updateData: any = {};

  if (businessTypeId) {
    updateData.businessType = { connect: { id: businessTypeId } };
  }
  if (othersData.bn_name) {
    updateData.bn_name = othersData.bn_name;
  }
  if (othersData.eng_name) {
    updateData.eng_name = othersData.eng_name;
  }

  const result = await prisma.category.update({
    where: { id: id },
    data: updateData,
  });
  return result;
};

const deleteSingle = async (id: string): Promise<Category | null> => {
  const isExist = await prisma.category.findUnique({ where: { id } });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found !');
  }
  const result = await prisma.category.delete({ where: { id } });

  return result;
};

export const CategoryServices = {
  createNew,
  getAll,
  getSingle,
  updateSingle,
  deleteSingle,
};
