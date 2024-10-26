import { Category } from '@prisma/client';
import { NextFunction } from 'express';
import fs from 'fs';
import httpStatus from 'http-status';
import path from 'path';
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
    throw new ApiError(httpStatus.NOT_FOUND, '5>Business type not found !');
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
const removePhoto = async (categoryId: string) => {
  const isCategoryExist = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!isCategoryExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not exist ');
  }
  if (!isCategoryExist.photo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category has not any picture');
  }
  const filePath = path.join(
    process.cwd(),
    'uploads/categoryPhoto',
    path.basename(isCategoryExist.photo),
  );
  if (fs.existsSync(filePath)) {
    try {
      await fs.promises.unlink(filePath); // Using fs.promises.unlink for a promise-based approach

      // Delete the image from the database
      const result = await prisma.category.update({
        where: { id: categoryId },
        data: {
          photo: '',
        },
      });
      return result;
    } catch (err) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `Failed to delete image or database record`,
      );
    }
  } else {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Image not found in the directory',
    );
  }
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

//? global function => its genarel photo delete function
const deletePhoto = async (photoLink: string) => {
  // Delete the image file from the server
  const filePath = path.join(
    process.cwd(),
    'uploads/categoryPhoto',
    path.basename(photoLink),
  );
  if (fs.existsSync(filePath)) {
    try {
      await fs.promises.unlink(filePath); // Using fs.promises.unlink for a promise-based approach

      console.log(`CategoryImage and database record deleted successfully.`);
    } catch (err) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `Failed to delete image or database record`,
      );
    }
  } else {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Image not found in the directory',
    );
  }
};
const updateSingle = async (
  req: any,
  next: NextFunction,
): Promise<Category | null> => {
  const { id } = req.params;
  const isExist = await prisma.category.findUnique({ where: { id } });

  if (!isExist) {
    //* delete uploaded photo
    deletePhoto(req.body.photo);
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found !');
  }

  const { businessTypeId, ...othersData } = req.body;

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

  if (othersData.photo) {
    if (isExist.photo) {
      deletePhoto(isExist.photo);
    }
    updateData.photo = othersData.photo;
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
  if (isExist.photo) {
    deletePhoto(isExist.photo);
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
  removePhoto,
};
