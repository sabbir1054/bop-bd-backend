import { User } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const getAll = async (userId: string): Promise<User[]> => {
  const andConditions: any[] = [];
  const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not valid');
  }
  const organizationId = isUserExist.organizationId;

  andConditions.push({ organizationId: organizationId });
  andConditions.push({ role: 'STAFF' });

  const result = await prisma.user.findMany({
    where: { AND: andConditions },
    include: {
      Staff: true,
    },
  });
  return result;
};
const getSingle = async (
  userId: string,
  staffUserId: string,
): Promise<User> => {
  const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not valid');
  }
  const organizationId = isUserExist.organizationId;

  const result = await prisma.user.findUnique({
    where: { id: staffUserId },
    include: { Staff: true },
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Staff not found');
  }
  return result;
};

const blockstaff = async (
  userId: string,
  userRole: string,
  staffId: string,
) => {
  let orgId = null;
  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
    });

    if (!isValidStaff || !isValidStaff.isValidNow) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Invalid user');
    }

    if (isValidStaff.role !== 'STAFF_ADMIN') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'You can not block user');
    }

    orgId = isValidStaff.organizationId;
  } else {
    const userInfo = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    orgId = userInfo.organizationId;
  }
  if (!orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }
  const isStaffExist = await prisma.staff.findUnique({
    where: { id: staffId },
  });
  if (!isStaffExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Staff info not found');
  }
  if (isStaffExist.organizationId !== orgId) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Staff not from your organization',
    );
  }

  const result = await prisma.staff.update({
    where: { id: staffId },
    data: { isValidNow: false },
  });

  return result;
};
const unBlockstaff = async (
  userId: string,
  userRole: string,
  staffId: string,
) => {
  let orgId = null;
  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
    });

    if (!isValidStaff || !isValidStaff.isValidNow) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Invalid user');
    }

    if (isValidStaff.role !== 'STAFF_ADMIN') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'You can not block user');
    }

    orgId = isValidStaff.organizationId;
  } else {
    const userInfo = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    orgId = userInfo.organizationId;
  }
  if (!orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }
  const isStaffExist = await prisma.staff.findUnique({
    where: { id: staffId },
  });
  if (!isStaffExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Staff info not found');
  }
  if (isStaffExist.organizationId !== orgId) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Staff not from your organization',
    );
  }

  const result = await prisma.staff.update({
    where: { id: staffId },
    data: { isValidNow: true },
  });

  return result;
};

export const staffServices = {
  getAll,
  getSingle,
  blockstaff,
  unBlockstaff,
};
