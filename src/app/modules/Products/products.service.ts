import { Product } from '@prisma/client';
import { Request } from 'express';
import fs from 'fs';
import httpStatus from 'http-status';
import path from 'path';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { productSearchableFields } from './product.constant';
interface MulterRequest extends Request {
  files?: Express.Multer.File[];
}
const createNew = async (req: Request): Promise<Product> => {
  const { ownerId, categoryId, fileUrls, ...others } = req.body;
  const result = await prisma.product.create({
    data: {
      owner: { connect: { id: ownerId } },
      category: { connect: { id: categoryId } },
      images: {
        create: fileUrls.map((url: string) => ({ url })),
      },
      ...others,
    },
    include: {
      owner: true,
      images: true,
      category: true,
    },
  });
  return result;
};

const getAllProduct = async (
  filters: any,
  options: IPaginationOptions,
): Promise<IGenericResponse<Product[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, minPrice, maxPrice, address, category, ...filtersData } =
    filters;
  const andConditions: any[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: productSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    const conditions = Object.entries(filtersData).map(([field, value]) => ({
      [field]: value,
    }));
    andConditions.push({ AND: conditions });
  }

  const minPriceFloat = parseFloat(minPrice);
  const maxPriceFloat = parseFloat(maxPrice);

  if (!isNaN(minPriceFloat)) {
    andConditions.push({
      price: {
        gte: minPriceFloat,
      },
    });
  }
  if (!isNaN(maxPriceFloat)) {
    andConditions.push({
      price: {
        lte: maxPriceFloat,
      },
    });
  }

  if (address) {
    andConditions.push({
      owner: {
        address: {
          contains: address,
          mode: 'insensitive',
        },
      },
    });
  }

  if (category) {
    andConditions.push({
      categoryId: category,
    });
  }

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.product.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
    include: {
      owner: {
        select: {
          id: true,
          memberCategory: true,
          verified: true,
          name: true,
          phone: true,
          address: true,
          photo: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      category: true,
      images: true,
      feedbacks: true,
    },
  });

  const total = await prisma.product.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getSingle = async (id: string): Promise<Product | null> => {
  const result = await prisma.product.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          memberCategory: true,
          verified: true,
          name: true,
          phone: true,
          address: true,
          photo: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      category: true,
      images: true,
      feedbacks: true,
    },
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product details not found');
  }
  return result;
};

const deleteImageFromProduct = async (
  imageId: string,
  productId: string,
  ownerId: string,
): Promise<Product | null> => {
  const isProductExist = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      owner: {
        select: {
          id: true,
          memberCategory: true,
          verified: true,
          name: true,
          phone: true,
          address: true,
          photo: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      category: true,
      images: true,
      feedbacks: true,
    },
  });

  if (!isProductExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found ');
  }

  const isImageExist = await prisma.image.findUnique({
    where: { id: imageId, productId: productId },
  });

  if (!isImageExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Image not found ');
  }

  // Delete the image file from the server
  const filePath = path.join(
    process.cwd(),
    'uploads',
    path.basename(isImageExist.url),
  );
  fs.unlink(filePath, err => {
    if (err) {
      console.log(err);

      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Failed to delete image: ${filePath}`,
      );
    }
  });

  // Delete the image from the database
  await prisma.image.delete({
    where: { id: imageId },
  });

  const result = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      owner: {
        select: {
          id: true,
          memberCategory: true,
          verified: true,
          name: true,
          phone: true,
          address: true,
          photo: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      category: true,
      images: true,
      feedbacks: true,
    },
  });

  return result;
};

export const ProductServices = {
  createNew,
  getAllProduct,
  getSingle,
  deleteImageFromProduct,
};
