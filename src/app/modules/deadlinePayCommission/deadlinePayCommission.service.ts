import { DeadlinePayCommission } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { IHandleDeadlineRequest } from './deadlineCommisssionPay.interface';

const createNew = async (
  payload: DeadlinePayCommission,
): Promise<DeadlinePayCommission> => {
  const isExist = await prisma.deadlinePayCommission.findUnique({
    where: {
      memberCategory: payload.memberCategory,
    },
  });
  if (isExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Deadline for the member category alredyexist, now edit it',
    );
  }
  const result = await prisma.deadlinePayCommission.create({
    data: payload,
  });
  return result;
};

const getAll = async (): Promise<DeadlinePayCommission[]> => {
  const result = await prisma.deadlinePayCommission.findMany();
  return result;
};

const updateSingle = async (
  id: string,
  payload: Partial<DeadlinePayCommission>,
): Promise<DeadlinePayCommission | null> => {
  const isExist = await prisma.deadlinePayCommission.findMany({
    where: { id: id },
  });

  if (!isExist) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Deadline not found, create first !',
    );
  }

  const result = await prisma.deadlinePayCommission.update({
    where: { id: id },
    data: {
      ...payload,
    },
  });

  return result;
};

const deleteSingle = async (id: string) => {
  const isExist = await prisma.deadlinePayCommission.findMany({
    where: { id: id },
  });

  if (!isExist) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Deadline not found, create first !',
    );
  }

  const result = await prisma.deadlinePayCommission.delete({
    where: { id: id },
  });

  return result;
};
const getSingle = async (id: string) => {
  const result = await prisma.deadlinePayCommission.findMany({
    where: { id: id },
  });

  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Deadline not found, create first !',
    );
  }

  return result;
};

const extendDeadlineRequest = async (
  userId: string,
  userRole: string,
  comment: string,
) => {
  let orgId = null;
  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
    });

    if (!isValidStaff || !isValidStaff.isValidNow) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid staff user id');
    }

    if (isValidStaff.role !== 'STAFF_ADMIN') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'You are not able to request');
    }

    orgId = isValidStaff.organizationId;
  } else {
    const userInfo = await prisma.user.findUnique({ where: { id: userId } });
    if (!userInfo) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user  id');
    }
    orgId = userInfo.organizationId;
  }

  if (!orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }

  const result = await prisma.requestExtendDeadline.create({
    data: { organizationId: orgId, comment: comment },
  });
  return result;
};

const handleDeadlineRequest = async (
  requestId: string,
  payload: IHandleDeadlineRequest,
) => {
  const isRequestExist = await prisma.requestExtendDeadline.findUnique({
    where: { id: requestId },
    include: { organization: true },
  });

  if (!isRequestExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request is not found');
  }
  const result = await prisma.$transaction(async prisma => {
    const handlerequest = await prisma.requestExtendDeadline.update({
      where: { id: requestId },
      data: {
        requestStatus: payload?.updatedStatus
          ? payload.updatedStatus
          : isRequestExist.requestStatus,
        isResolved: true,
      },
    });
    const updateExtendDays = await prisma.organization.update({
      where: { id: isRequestExist.organizationId },
      data: {
        deadlineExtendfor: payload?.extendDays
          ? payload.extendDays
          : isRequestExist.organization.deadlineExtendfor,
      },
    });

    return {
      ...handleDeadlineRequest,
      extededDays: updateExtendDays.deadlineExtendfor,
    };
  });
  return result;
};

const updateMyRequest = async (
  userId: string,
  userRole: string,
  requestId: string,
  payload: IHandleDeadlineRequest,
) => {
  if (payload.extendDays) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You cant not set exted days');
  }
  const isRequestExist = await prisma.requestExtendDeadline.findUnique({
    where: { id: requestId },
    include: { organization: true },
  });

  if (!isRequestExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request is not found');
  }

  if (isRequestExist.isResolved) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request is alredy resolved');
  }

  let orgId = null;
  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
    });

    if (!isValidStaff || !isValidStaff.isValidNow) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid staff user id');
    }

    if (isValidStaff.role !== 'STAFF_ADMIN') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'You are not able to request');
    }

    orgId = isValidStaff.organizationId;
  } else {
    const userInfo = await prisma.user.findUnique({ where: { id: userId } });
    if (!userInfo) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user  id');
    }
    orgId = userInfo.organizationId;
  }

  if (!orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }
  if (isRequestExist.organizationId !== orgId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid request id');
  }
  const result = await prisma.requestExtendDeadline.update({
    where: { id: requestId },
    data: {
      comment: payload?.comment ? payload.comment : isRequestExist.comment,
      requestStatus: payload?.updatedStatus
        ? payload.updatedStatus
        : isRequestExist.requestStatus,
    },
  });
  return result;
};
const getAllDeadlineExtendRequest = async (
  userId: string,
  userRole: string,
) => {
  // const result = await prisma.$transaction(async prisma => {
  //   if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
  //     const result = await prisma.requestExtendDeadline.findMany();
  //     return result;
  //   } else {
  //     let orgId = null;

  //     if (userRole === 'STAFF') {
  //       const isValidStaff = await prisma.staff.findUnique({
  //         where: { staffInfoId: userId },
  //       });

  //       if (!isValidStaff || !isValidStaff.isValidNow) {
  //         throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid staff user id');
  //       }

  //       if (isValidStaff.role !== 'STAFF_ADMIN') {
  //         throw new ApiError(
  //           httpStatus.BAD_REQUEST,
  //           'You are not able to request',
  //         );
  //       }

  //       orgId = isValidStaff.organizationId;
  //     } else {
  //       const userInfo = await prisma.user.findUnique({
  //         where: { id: userId },
  //       });
  //       if (!userInfo) {
  //         throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user  id');
  //       }
  //       orgId = userInfo.organizationId;
  //     }

  //     if (!orgId) {
  //       throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  //     }

  //     const result = await prisma.requestExtendDeadline.findMany({
  //       where: {
  //         organizationId: orgId,
  //       },
  //     });
  //     return result;
  //   }
  // });
  console.log(userId, userRole);

  const result = await prisma.requestExtendDeadline.findMany();
  return result;
};
const getSingleRequest = async (
  userId: string,
  userRole: string,
  requestId: string,
) => {
  if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
    const result = await prisma.requestExtendDeadline.findUnique({
      where: { id: requestId },
    });
    if (!result) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
    }
    return result;
  }

  let orgId = null;

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
    });

    if (!isValidStaff || !isValidStaff.isValidNow) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid staff user id');
    }

    if (isValidStaff.role !== 'STAFF_ADMIN') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'You are not able to request');
    }

    orgId = isValidStaff.organizationId;
  } else {
    const userInfo = await prisma.user.findUnique({ where: { id: userId } });
    if (!userInfo) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user  id');
    }
    orgId = userInfo.organizationId;
  }

  if (!orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }

  const result = await prisma.requestExtendDeadline.findUnique({
    where: { id: requestId },
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  if (result.organizationId !== orgId) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Request not found in your organization',
    );
  }
  return result;
};

//? cron jobs
const suspendOrganizations = async () => {
  const fixedDaysAgo = new Date();
  const result = await prisma.$transaction(async prisma => {
    //* get all kind of deadline
    const getAllDeadline = await prisma.deadlinePayCommission.findMany();
    getAllDeadline.map(async deadline => {
      fixedDaysAgo.setDate(
        fixedDaysAgo.getDate() - parseInt(deadline.deadline),
      );
      const isDueExist = await prisma.organization.updateMany({
        where: {
          AND: [
            { memberShipCategory: deadline.memberCategory },
            { totalCommission: { gt: 0 } },
            {
              PayCommission: {
                some: {
                  updatedAt: {
                    gte: fixedDaysAgo, // Checks if updatedAt is within the last 10 days
                  },
                },
              },
            },
          ],
        },
        data: {
          isSuspend: true,
        },
      });
    });
  });
};
export const DeadlinePayCommissionServices = {
  createNew,
  getAll,
  updateSingle,
  deleteSingle,
  getSingle,
  extendDeadlineRequest,
  handleDeadlineRequest,
  getSingleRequest,
  getAllDeadlineExtendRequest,
  updateMyRequest,
  suspendOrganizations,
};
