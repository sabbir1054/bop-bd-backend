import { Product } from '@prisma/client';
import { Request } from 'express';
import prisma from '../../../shared/prisma';
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

export const ProductServices = {
  createNew,
};
