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

  let orgId = null;
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
      if (
        isValidStaff.role === 'STORE_MANAGER' ||
        isValidStaff.role === 'STAFF_ADMIN'
      ) {
        orgId = isValidStaff.organization.id;
      } else {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Only store manager or admin update product info',
        );
      }
    }
  } else {
    const isExistUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!isExistUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No user found');
    }
    orgId = isExistUser.organizationId;
  }

  if (!orgId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Organization info not found');
  }
  //* organization info
  const organizationInfo = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { owner: true, BusinessType: { include: { category: true } } },
  });

  if (!organizationInfo?.owner.verified) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Organization not verified');
  }

  if (!organizationInfo?.businessTypeId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Please set user business type and complete profile',
    );
  }
  // Extract the array of category IDs
  const categoryIds = organizationInfo.BusinessType?.category.map(
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
      organizationId: organizationInfo.id,
      categoryId: categoryId,
      images: {
        create: fileUrls.map((url: string) => ({ url })),
      },
      ...others,
    },
    include: {
      organization: true,
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
      organization: true,
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
      organization: {
        include: {
          owner: true,
          BusinessType: true,
        },
      },
      category: true,
      images: true,
      feedbacks: {
        include: {
          Organization: true,
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
  let orgId = null;

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { organization: true },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
    }
    if (
      isValidStaff.role === 'STORE_MANAGER' ||
      isValidStaff.role === 'STAFF_ADMIN'
    ) {
      orgId = isValidStaff.organization.id;
    } else {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only store manager or admin update product info',
      );
    }
  } else {
    if (!userId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User info not found');
    }
    const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
    orgId = isUserExist?.organizationId;
  }

  const isProductExist = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      organization: true,
      category: true,
      images: true,
      feedbacks: true,
    },
  });

  if (!isProductExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found ');
  }

  if (isProductExist?.organizationId !== orgId) {
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
      organization: true,
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
  let orgId = null;

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { organization: true },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
    }
    if (
      isValidStaff.role === 'STORE_MANAGER' ||
      isValidStaff.role === 'STAFF_ADMIN'
    ) {
      orgId = isValidStaff.organization.id;
    } else {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only store manager or admin update product info',
      );
    }
  } else {
    const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
    orgId = isUserExist?.organizationId;
  }
  const isProductExist = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      organization: true,
      category: true,
      images: true,
      feedbacks: true,
    },
  });

  if (!orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }

  if (!isProductExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found ');
  }
  if (isProductExist?.organizationId !== orgId) {
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
      organization: true,
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

  let orgId = null;

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { organization: true },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
    }
    if (
      isValidStaff.role === 'STORE_MANAGER' ||
      isValidStaff.role === 'STAFF_ADMIN'
    ) {
      orgId = isValidStaff.organization.id;
    } else {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only store manager or admin update product info',
      );
    }
  } else {
    const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
    orgId = isUserExist?.organizationId;
  }
  const { categoryId, ...othersInfo } = payload;

  const isProductExist = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      organization: true,
      category: true,
      images: true,
      feedbacks: true,
    },
  });

  if (!isProductExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found ');
  }
  if (!orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }
  if (isProductExist?.organizationId !== orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid owner info ');
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
  let orgId = null;

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { organization: true },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
    }
    if (
      isValidStaff.role === 'STORE_MANAGER' ||
      isValidStaff.role === 'STAFF_ADMIN'
    ) {
      orgId = isValidStaff.organization.id;
    } else {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only store manager or admin update product info',
      );
    }
  } else {
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      const productOwner = await prisma.product.findUnique({
        where: { id: productId },
      });

      orgId = productOwner?.organizationId;
    } else {
      const isUserExist = await prisma.user.findUnique({
        where: { id: userId },
      });
      orgId = isUserExist?.organizationId;
    }
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
  if (!orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }
  // Check if the owner is the same as the one making the request
  if (isProductExist.organizationId !== orgId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid owner info');
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
