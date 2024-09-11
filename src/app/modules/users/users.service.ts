import { Staff, User } from '@prisma/client';
import { NextFunction, Request } from 'express';
import fs from 'fs';
import httpStatus from 'http-status';
import path from 'path';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { IUpdateStaffPayload } from './user.constant';
import { IStaffRole } from './user.interface';
const updateUserProfile = async (req: Request, next: NextFunction) => {
  const { id: userId } = req.user as any;

  const deletePhoto = (photoLink: string) => {
    // Delete the image file from the server
    const filePath = path.join(
      process.cwd(),
      'uploads/userPhoto',
      path.basename(photoLink),
    );
    fs.unlink(filePath, err => {
      if (err) {
        deletePhoto(req.body.photo);
        next(
          new ApiError(
            httpStatus.BAD_REQUEST,
            `Failed to delete previous image, try again for update,photo `,
          ),
        );
      }
    });
  };

  const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
  if (!isUserExist) {
    //* delete uploaded photo
    deletePhoto(req.body.photo);
    throw new ApiError(httpStatus.NOT_FOUND, 'User not exist');
  }
  //* make updated data
  const data: any = req.body as any;

  const result = await prisma.$transaction(async prisma => {
    if (data.shop_name) {
      await prisma.organization.update({
        where: { ownerId: isUserExist.id },
        data: { name: data.shop_name },
      });
    }

    const { shop_name, ...updatedData } = data;
    console.log(req.body);

    if (isUserExist.photo && req.body.photo !== isUserExist.photo) {
      //* delete photo
      if (req.body.photo) {
        deletePhoto(isUserExist?.photo);
      }
      const result = await prisma.user.update({
        where: { id: userId },
        data: {
          ...updatedData,
        },
        select: {
          id: true,
          role: true,
          memberCategory: true,
          verified: true,
          organization: true,
          isMobileVerified: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          photo: true,
          license: true,
          nid: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return result;
    } else {
      const result = await prisma.user.update({
        where: { id: userId },
        data: {
          ...updatedData,
        },
        select: {
          id: true,
          role: true,
          memberCategory: true,
          verified: true,
          organization: true,
          isMobileVerified: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          photo: true,
          license: true,
          nid: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return result;
    }
  });
  return result;
};

const removeProfilePicture = async (userId: string): Promise<Partial<User>> => {
  const isUserExist = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not exist');
  }
  if (!isUserExist.photo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User has not any picture');
  }
  const filePath = path.join(
    process.cwd(),
    'uploads/userPhoto',
    path.basename(isUserExist.photo),
  );
  fs.unlink(filePath, err => {
    if (err) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Failed to delete image: ${filePath}`,
      );
    }
  });
  const result = await prisma.user.update({
    where: { id: userId },
    data: {
      photo: '',
    },
    select: {
      id: true,
      role: true,
      verified: true,
      organization: true,
      isMobileVerified: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      photo: true,
      license: true,
      nid: true,
    },
  });

  return result;
};

const getAll = async (): Promise<Partial<User>[]> => {
  const result = await prisma.user.findMany({
    select: {
      id: true,
      role: true,
      verified: true,
      organization: {
        include: {
          BusinessType: true,
        },
      },
      isMobileVerified: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      photo: true,
      license: true,
      nid: true,
    },
  });
  return result;
};

const getSingle = async (
  userId: string,
  profileId: string,
  role: string,
): Promise<User | null | Staff> => {
  if (role === 'STAFF') {
    let result = await prisma.staff.findUnique({
      where: { staffInfoId: profileId },
      include: {
        organization: {
          include: {
            owner: true,
          },
        },
        staffInfo: true,
      },
    });

    if (!result) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found !');
    }
    result.staffInfo.password = '';

    return result;
  }

  const result = await prisma.user.findUnique({
    where: { id: profileId },
    include: {
      organization: {
        include: {
          feedbacks: true,
          cart: {
            include: {
              CartItem: true,
            },
          },
          products: true,
          outgoing_order: {
            include: { orderItems: true },
          },
          incoming_order: {
            include: { orderItems: true },
          },
          BusinessType: true,
        },
      },
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found !');
  }

  if (role === ('ADMIN' || 'SUPER_ADMIN')) {
    return result;
  } else {
    if (userId !== result.id) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'You can only see you profile',
      );
    } else {
      return result;
    }
  }
};

const deleteUnverifiedOtp = async (phone: string) => {
  const isUserExist = await prisma.user.findUnique({ where: { phone: phone } });
  const isOtpCreate = await prisma.oneTimePassword.findUnique({
    where: { phone: phone },
  });
  if (isUserExist?.isMobileVerified) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'User is verified. Please contact with admin for delete',
    );
  }
  const result = await prisma.$transaction(async prisma => {
    if (isUserExist && isOtpCreate) {
      await prisma.user.delete({ where: { phone: phone } });
      await prisma.oneTimePassword.delete({ where: { phone: phone } });
    } else {
      if (isUserExist) {
        await prisma.user.delete({ where: { phone: phone } });
      }

      if (isOtpCreate) {
        await prisma.oneTimePassword.delete({ where: { phone: phone } });
      }
    }

    return 'Delete user';
  });

  return result;
};

const userVerifiedStatusChange = async (
  status: boolean,
  userId: string,
  role: string,
) => {
  const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (role !== ('ADMIN' || 'SUPER_ADMIN')) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You are not able to change');
  }
  const result = await prisma.user.update({
    where: { id: userId },
    data: { verified: status },
  });

  return result;
};

const getOrganizationStaff = async (
  userId: string,
  userRole: string,
  role?: IStaffRole,
) => {
  const andConditions: any[] = [];
  let ownerId: string | null = null;

  if (userRole === 'STAFF') {
    const findOwnerId = await prisma.user.findUnique({
      where: { id: userId },
      include: { Staff: { include: { organization: true } } },
    });

    if (findOwnerId?.Staff?.role !== 'STAFF_ADMIN') {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Only staff admins can see this',
      );
    }

    if (!findOwnerId?.Staff?.organization.ownerId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
    }

    ownerId = findOwnerId.Staff?.organization.ownerId;
  } else {
    ownerId = userId;
  }

  if (!ownerId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Owner ID is required');
  }

  const organization = await prisma.organization.findUnique({
    where: { ownerId },
  });

  if (!organization) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization not found');
  }

  andConditions.push({ organizationId: organization.id });

  if (role?.staffRole) {
    andConditions.push({ role: role.staffRole });
  }

  const staffMembers = await prisma.staff.findMany({
    where: {
      AND: andConditions,
    },
    include: {
      staffInfo: {
        select: {
          id: true,
          role: true,
          verified: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          isMobileVerified: true,
        },
      },
    },
  });

  return staffMembers;
};

const getMyDeliveryBoy = async (userId: string) => {
  const isExistStaff = await prisma.staff.findUnique({
    where: { staffInfoId: userId },
  });

  if (!isExistStaff) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Staff info not found');
  }
  if (isExistStaff.role !== 'ORDER_SUPERVISOR') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Only order supervisor can get this',
    );
  }
  const organization = await prisma.organization.findUnique({
    where: { id: isExistStaff.organizationId },
  });

  if (!organization) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization not found');
  }
  const andConditions: any[] = [];

  andConditions.push({ organizationId: organization.id });
  andConditions.push({ role: 'DELIVERY_BOY' });

  const staffMembers = await prisma.staff.findMany({
    where: {
      AND: andConditions,
    },
    include: {
      staffInfo: {
        select: {
          id: true,
          role: true,
          verified: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          isMobileVerified: true,
        },
      },
    },
  });

  return staffMembers;
};

const deleteMySingleStaff = async (
  userId: string,
  userRole: string,
  staffId: string,
) => {
  const isExistStaff = await prisma.staff.findUnique({
    where: { id: staffId },
    include: {
      staffInfo: true,
    },
  });

  if (!isExistStaff) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Staff id not found');
  }

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { staffInfo: true },
    });

    if (isValidStaff?.role !== 'STAFF_ADMIN') {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Only owner and admin staff can delete staff',
      );
    }
  }

  const result = prisma.$transaction(async prisma => {
    await prisma.staff.delete({ where: { id: staffId } });
    const result = await prisma.user.delete({
      where: { id: isExistStaff.staffInfoId },
    });
    return result;
  });

  return result;
};

const updateMySingleStaffRole = async (
  userId: string,
  userRole: string,
  payload: IUpdateStaffPayload,
) => {
  const isExistStaff = await prisma.staff.findUnique({
    where: { id: payload.staffId },
    include: {
      staffInfo: true,
    },
  });

  if (!isExistStaff) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Staff id not found');
  }

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { staffInfo: true },
    });

    if (isValidStaff?.role !== 'STAFF_ADMIN') {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Only owner and admin staff can update staff',
      );
    }
  }

  const result = await prisma.staff.update({
    where: { id: payload.staffId },
    data: { role: payload.updatedRole },
  });

  return result;
};

export const UserServices = {
  updateUserProfile,
  removeProfilePicture,
  getAll,
  getSingle,
  deleteUnverifiedOtp,
  userVerifiedStatusChange,
  getOrganizationStaff,
  getMyDeliveryBoy,
  deleteMySingleStaff,
  updateMySingleStaffRole,
};
