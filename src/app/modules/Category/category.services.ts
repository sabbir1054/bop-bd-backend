import { Category } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const createNew = async (payload: Category): Promise<Category> => {
  const result = await prisma.category.create({
    data: payload,
  });
  return result;
};

const getAll = async (): Promise<Category[]> => {
  const result = await prisma.category.findMany();
  return result;
};

const getSingle = async (id: string): Promise<Category | null> => {
  const result = await prisma.category.findUnique({ where: { id } });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found !');
  }

  return result;
};
const updateSingle = async (
  id: string,
  data: Partial<Category>,
): Promise<Category | null> => {
  const isExist = await prisma.category.findUnique({ where: { id } });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Amenity not found !');
  }
  const result = await prisma.category.update({ where: { id }, data });

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
