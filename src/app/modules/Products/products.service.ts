import { Product } from '@prisma/client';
import { Request } from 'express';
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

export const ProductServices = {
  createNew,
  getAllProduct,
};
