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
import { IUpdateProductInput } from './product.interface';
interface MulterRequest extends Request {
  files?: Express.Multer.File[];
}
const createNew = async (req: Request): Promise<Product> => {
  const { ownerId, categoryId, fileUrls, ...others } = req.body;
  const { id: userId } = req.user as any;
  if (ownerId !== userId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Owner id does not match with user',
    );
  }
  const ownerBusinessTypeCheck = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      businessType: {
        include: {
          category: true,
        },
      },
    },
  });
  if (!ownerBusinessTypeCheck || !ownerBusinessTypeCheck?.businessTypeId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Please set user business type and complete profile',
    );
  }
  // Extract the array of category IDs
  const categoryIds = ownerBusinessTypeCheck.businessType?.category.map(
    cat => cat.id,
  );

  // Check if the specific category ID is in the array
  const isCategoryPresent = categoryIds?.includes(categoryId);

  if (!isCategoryPresent) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Category ID is not associated with the user's business type",
    );
  }
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
  const {
    searchTerm,
    minPrice,
    maxPrice,
    address,
    category,
    ownerType,
    ...filtersData
  } = filters;
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

  if (ownerType) {
    andConditions.push({
      owner: {
        role: ownerType,
      },
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
      category: true,
      images: true,
      feedbacks: true,
    },
  });

  if (!isProductExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found ');
  }
  if (isProductExist?.ownerId !== ownerId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Only owner can update products ');
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
          feedbacks: true,
          businessType: true,
          businessTypeId: true,
        },
      },
      category: true,
      images: true,
      feedbacks: true,
    },
  });

  return result;
};

const addNewImageForProduct = async (req: Request): Promise<Product | null> => {
  const { productId } = req.params;
  const { id: ownerId } = req.user as any;
  const { fileUrls } = req.body;

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
  if (isProductExist?.ownerId !== ownerId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Only owner can update products ');
  }

  //* check number of images
  const currentImageCount = isProductExist.images.length;
  const newImagesCount = fileUrls.length;

  if (currentImageCount + newImagesCount > 5) {
    const availableSlots = 5 - currentImageCount;

    if (availableSlots < newImagesCount) {
      const excessFiles = fileUrls.slice(availableSlots);
      excessFiles.forEach((url: string) => {
        const filePath = path.join(
          process.cwd(),
          'uploads',
          path.basename(url),
        );
        fs.unlink(filePath, err => {
          if (err) {
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              `Failed to delete image: ${filePath}`,
            );
          }
        });
      });
    }
    // Trim the fileUrls array to fit the available slots
    fileUrls.splice(availableSlots, newImagesCount - availableSlots);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `You can upload only ${availableSlots} images`,
    );
  }

  const result = await prisma.product.update({
    where: { id: productId },
    data: {
      images: {
        create: fileUrls.map((url: string) => ({ url })),
      },
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
  return result;
};

const updateProductInfo = async (
  productId: string,
  ownerId: string,
  payload?: IUpdateProductInput,
): Promise<Product | null> => {
  if (!payload) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No update data provided');
  }
  const { categoryId, ...othersInfo } = payload;

  const isProductExist = await prisma.product.findUnique({
    where: { id: productId },
    include: {
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
      category: true,
      images: true,
      feedbacks: true,
    },
  });

  if (!isProductExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found ');
  }
  if (isProductExist?.ownerId !== ownerId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Only owner can update products ');
  }

  const result = await prisma.product.update({
    where: { id: productId },
    data: {
      ...othersInfo,
      ...(categoryId && { category: { connect: { id: categoryId } } }),
    },
  });

  return result;
};
const deleteProduct = async (
  productId: string,
  ownerId: string,
): Promise<Product | null> => {
  const isProductExist = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!isProductExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found ');
  }
  if (isProductExist?.ownerId !== ownerId) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Only product owner can delete products ',
    );
  }

  const result = await prisma.product.delete({
    where: { id: productId },
  });

  return result;
};
export const ProductServices = {
  createNew,
  getAllProduct,
  getSingle,
  deleteImageFromProduct,
  addNewImageForProduct,
  updateProductInfo,
  deleteProduct,
};
