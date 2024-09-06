import { Commission } from '@prisma/client';
import prisma from '../../../shared/prisma';

const createNew = async (payload: Commission): Promise<Commission> => {
  const result = await prisma.commission.create({
    data: payload,
  });
  return result;
};

// const getAll = async (): Promise<BusinessType[]> => {
//   const result = await prisma.businessType.findMany();
//   return result;
// };

// const getSingle = async (id: string): Promise<BusinessType | null> => {
//   const result = await prisma.businessType.findUnique({
//     where: { id },
//     include: {
//       category: true,
//       organization: true,
//     },
//   });

//   if (!result) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Business type not found !');
//   }

//   return result;
// };
// const updateSingle = async (
//   id: string,
//   data: Partial<BusinessType>,
// ): Promise<BusinessType | null> => {
//   const isExist = await prisma.businessType.findUnique({ where: { id } });

//   if (!isExist) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Business type not found !');
//   }
//   const result = await prisma.businessType.update({ where: { id }, data });

//   return result;
// };

// const deleteSingle = async (id: string): Promise<BusinessType | null> => {
//   const isExist = await prisma.businessType.findUnique({ where: { id } });

//   if (!isExist) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Business type not found !');
//   }
//   const result = await prisma.businessType.delete({ where: { id } });

//   return result;
// };

// const getAllProductBusinessType = async (id: string): Promise<Category[]> => {
//   const isBusinessTypeExist = await prisma.businessType.findUnique({
//     where: { id: id },
//     include: {
//       category: {
//         include: {
//           products: {
//             include: {
//               images: true,
//               organization: {
//                 include: {
//                   owner: {
//                     select: {
//                       id: true,
//                       role: true,
//                       verified: true,
//                       organization: true,
//                       isEmailVerified: true,
//                       name: true,
//                       email: true,
//                       phone: true,
//                       address: true,
//                       photo: true,
//                       license: true,
//                       nid: true,
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//   });
//   if (!isBusinessTypeExist) {
//     throw new ApiError(httpStatus.NOT_FOUND, ' Business type not found !');
//   }
//   const result = isBusinessTypeExist.category;
//   return result;
// };

export const CommissionServices = {
  createNew,
};
