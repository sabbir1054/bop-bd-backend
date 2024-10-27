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
  if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
    const result = await prisma.requestExtendDeadline.findMany({
      include: { organization: { include: { owner: true } } },
    });
    return result;
  } else {
    let orgId = null;

    if (userRole === 'STAFF') {
      const isValidStaff = await prisma.staff.findUnique({
        where: { staffInfoId: userId },
      });

      if (!isValidStaff || !isValidStaff.isValidNow) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid staff user id');
      }

      if (isValidStaff.role !== 'STAFF_ADMIN') {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'You are not able to request',
        );
      }

      orgId = isValidStaff.organizationId;
    } else {
      const userInfo = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!userInfo) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user  id');
      }
      orgId = userInfo.organizationId;
    }

    if (!orgId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
    }

    const result = await prisma.requestExtendDeadline.findMany({
      where: {
        organizationId: orgId,
      },
      include: { organization: { include: { owner: true } } },
    });
    return result;
  }
};
const getSingleRequest = async (
  userId: string,
  userRole: string,
  requestId: string,
) => {
  if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
    const result = await prisma.requestExtendDeadline.findUnique({
      where: { id: requestId },
      include: {
        organization: { include: { owner: true, PayCommission: true } },
      },
    });
    if (!result) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
    }
    return result;
  } else {
    let orgId = null;

    if (userRole === 'STAFF') {
      const isValidStaff = await prisma.staff.findUnique({
        where: { staffInfoId: userId },
      });

      if (!isValidStaff || !isValidStaff.isValidNow) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid staff user id');
      }

      if (isValidStaff.role !== 'STAFF_ADMIN') {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'You are not able to see request',
        );
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
      include: {
        organization: { include: { owner: true, PayCommission: true } },
      },
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
  }
};

const getSingleOrganizationDeadlineDate = async (orgId: string) => {
  const isOrganizationExist = await prisma.organization.findUnique({
    where: { id: orgId },
  });
  if (!isOrganizationExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization not found');
  }

  const result = await prisma.$transaction(async prisma => {
    const deadlineInfo = await prisma.deadlinePayCommission.findFirst();
    if (!deadlineInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Deadline info not set');
    }
    const latestPayCommission = await prisma.payCommission.findMany({
      orderBy: {
        createdAt: 'desc', // Order by createdAt in descending order
      },
      take: 1, // Limit to the latest record (you can remove or adjust this to get multiple records)
      include: {
        transactionDetails: true, // Include related TransactionInfoForPayCommission data
        organization: true, // Include related Organization data if needed
      },
    });
    // Calculate the deadline date for commission payment
    const lastPaymentDate = latestPayCommission[0]?.createdAt || new Date();
    const extendedDays = isOrganizationExist.deadlineExtendfor || 0;

    // Calculate the final deadline by adding normal deadline days and extended days
    const finalDeadlineDate = new Date(
      new Date(lastPaymentDate).setDate(
        lastPaymentDate.getDate() +
          parseInt(deadlineInfo.deadline, 10) +
          extendedDays,
      ),
    );

    return finalDeadlineDate;
  });
  return result;
};
//? cron jobs
// const suspendOrganizations = async () => {
//   const fixedDaysAgo = new Date();
//   const result = await prisma.$transaction(async prisma => {
//     //* get all kind of deadline
//     const getAllDeadline = await prisma.deadlinePayCommission.findMany();
//     getAllDeadline.map(async deadline => {
//       fixedDaysAgo.setDate(
//         fixedDaysAgo.getDate() - parseInt(deadline.deadline),
//       );
//       const isDueExist = await prisma.organization.updateMany({
//         where: {
//           AND: [
//             { memberShipCategory: deadline.memberCategory },
//             { totalCommission: { gt: 0 } },
//             {
//               PayCommission: {
//                 some: {
//                   updatedAt: {
//                     gte: fixedDaysAgo, // Checks if updatedAt is within the last 10 days
//                   },
//                 },
//               },
//             },
//           ],
//         },
//         data: {
//           isSuspend: true,
//         },
//       });
//     });
//   });
// };
const suspendOrganizations = async () => {
  const result = await prisma.$transaction(async prisma => {
    // Get all kinds of deadlines
    const getAllDeadline = await prisma.deadlinePayCommission.findMany();

    // Loop through each deadline and process accordingly
    for (const deadline of getAllDeadline) {
      // Find organizations with unpaid commissions and consider deadlineExtendFor
      const organizations = await prisma.organization.findMany({
        where: {
          memberShipCategory: deadline.memberCategory,
          totalCommission: { gt: 0 },
          isSuspend: false, // Only active organizations
        },
        select: {
          id: true,
          deadlineExtendfor: true, // We need this for calculating adjusted deadline
          PayCommission: {
            select: {
              updatedAt: true,
            },
            orderBy: {
              updatedAt: 'desc',
            },
            take: 1, // Get the latest payment commission date
          },
        },
      });

      for (const org of organizations) {
        // Calculate the adjusted deadline with extended days
        const fixedDaysAgo = new Date();
        const totalDeadlineDays =
          parseInt(deadline.deadline) + (org.deadlineExtendfor || 0); // Sum of original deadline + extended days
        fixedDaysAgo.setDate(fixedDaysAgo.getDate() - totalDeadlineDays);

        // Check if the latest payment commission was before the adjusted deadline
        const latestCommission = org.PayCommission[0];
        if (latestCommission && latestCommission.updatedAt < fixedDaysAgo) {
          // Suspend the organization if it hasn't paid within the adjusted deadline
          await prisma.organization.update({
            where: { id: org.id },
            data: { isSuspend: true },
          });
        }
      }
    }
  });

  return result;
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
  getSingleOrganizationDeadlineDate,
};
