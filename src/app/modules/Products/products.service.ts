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
  const { categoryId, fileUrls, ...others } = req.body;
  const { id: userId, role } = req.user as any;

  let ownerId = null;
  if (role === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: {
        organization: true,
      },
    });

    if (!isValidStaff) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff  is invalid');
    } else {
      if (isValidStaff.role !== ('STORE_MANAGER' || 'STAFF_ADMIN')) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Only store manager and admin can create products',
        );
      }

      ownerId = isValidStaff.organization.ownerId;
    }
  } else {
    ownerId = userId;
  }

  if (!ownerId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Owner info not found');
  }
  const ownerBusinessTypeCheck = await prisma.user.findUnique({
    where: { id: ownerId },
    include: {
      businessType: {
        include: {
          category: true,
        },
      },
    },
  });
  if (!ownerBusinessTypeCheck?.verified) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Owner is not verified');
  }
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
          role: true,
          memberCategory: true,
          verified: true,
          name: true,
          phone: true,
          address: true,
          photo: true,
          createdAt: true,
          updatedAt: true,
          businessType: true,
        },
      },
      category: true,
      images: true,
      feedbacks: {
        include: {
          user: {
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
              businessType: true,
              role: true,
            },
          },
        },
      },
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
  userId: string,
  userRole: string,
): Promise<Product | null> => {
  let ownerId = null;

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { organization: true },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
    }
    if (isValidStaff.role !== ('STORE_MANAGER' || 'STAFF_ADMIN')) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only store manager or admin delete the product image',
      );
    }
    ownerId = isValidStaff.organization.ownerId;
  } else {
    ownerId = userId;
  }

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
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid staff/owner  ');
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
  const { id: userId, role: userRole } = req.user as any;
  const { fileUrls } = req.body;
  let ownerId = null;

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { organization: true },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
    }
    if (isValidStaff.role !== ('STORE_MANAGER' || 'STAFF_ADMIN')) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only store manager or admin add the product image',
      );
    }
    ownerId = isValidStaff.organization.ownerId;
  } else {
    ownerId = userId;
  }
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
  userId: string,
  userRole: string,
  payload?: IUpdateProductInput,
): Promise<Product | null> => {
  if (!payload) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No update data provided');
  }

  let ownerId = null;

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { organization: true },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
    }
    if (isValidStaff.role !== ('STORE_MANAGER' || 'STAFF_ADMIN')) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only store manager or admin update product info',
      );
    }
    ownerId = isValidStaff.organization.ownerId;
  } else {
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      const productOwner = await prisma.product.findUnique({
        where: { id: productId },
      });

      ownerId = productOwner?.ownerId;
    } else {
      ownerId = userId;
    }
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
  userId: string,
  userRole: string,
): Promise<Product | null> => {
  let ownerId = null;

  if (userRole !== 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { organization: true },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
    }
    if (isValidStaff.role !== ('STORE_MANAGER' || 'STAFF_ADMIN')) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only store manager or admin delete the product image',
      );
    }
    ownerId = isValidStaff.organization.ownerId;
  } else {
    ownerId = userId;
  }

  // Check if the product exists
  const isProductExist = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: true,
    },
  });

  if (!isProductExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  // Check if the owner is the same as the one making the request
  if (isProductExist.ownerId !== ownerId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Only product owner can delete products',
    );
  }
  const result = await prisma.$transaction(async prisma => {
    // Delete images from the server
    for (const image of isProductExist.images) {
      const filePath = path.join(
        process.cwd(),
        'uploads',
        path.basename(image.url),
      );
      fs.unlink(filePath, err => {
        if (err) {
          console.error(`Failed to delete image: ${filePath}`);
        }
      });
    }

    // Delete image records from the database
    await prisma.image.deleteMany({
      where: { productId: productId },
    });

    // Delete the product
    const result = await prisma.product.delete({
      where: { id: productId },
    });
    return result;
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
