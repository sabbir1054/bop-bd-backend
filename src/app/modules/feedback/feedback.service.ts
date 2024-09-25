import { Feedback } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { IFeedbackCreate, IFeedbackUpdate } from './feedback.Interface';

const createNew = async (
  id: string,
  userRole: string,
  payload: IFeedbackCreate,
): Promise<Feedback> => {
  const { productId, rating, comment } = payload;
  let orgId = null;

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: id },
      include: {
        organization: true,
      },
    });
    if (!isValidStaff || !isValidStaff.isValidNow) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff info not found');
    }
    const validStaffRole = ['STAFF_ADMIN'];
    if (!validStaffRole.includes(isValidStaff.role)) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff role not valid');
    }
    orgId = isValidStaff.organization.id;
  } else {
    const userInfo = await prisma.user.findUnique({ where: { id: id } });
    if (!userInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    orgId = userInfo.organizationId;
  }

  if (!orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Owner info not found');
  }

  if (rating > 5) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Rating not more than 5');
  }

  const isProductExist = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!isProductExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product does not exist');
  }
  const orders = await prisma.order.findMany({
    where: {
      customerId: orgId,
      orderItems: {
        some: {
          productId: productId,
        },
      },
    },
    include: {
      orderItems: true,
    },
  });
  //* Calculate the total quantity of the product the user has purchased
  const totalPurchased = orders.reduce((sum, order) => {
    return (
      sum +
      order.orderItems
        .filter(item => item.productId === productId)
        .reduce((subSum, item) => subSum + item.quantity, 0)
    );
  }, 0);
  if (totalPurchased === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'User has not purchased this product.',
    );
  }
  //* Count the number of feedbacks the user has already given for the product
  const feedbackCount = await prisma.feedback.count({
    where: {
      organizationId: orgId,
      productId: productId,
    },
  });
  if (feedbackCount >= totalPurchased) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'User has already given the maximum number of feedbacks for this product.',
    );
  }
  // Create feedback
  const result = await prisma.feedback.create({
    data: {
      rating,
      comment,
      Organization: { connect: { id: orgId } },
      product: { connect: { id: productId } },
    },
  });
  return result;
};

const getAll = async (role: string, userId: string): Promise<Feedback[]> => {
  let orgId = null;

  if (role === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: {
        organization: true,
      },
    });
    if (!isValidStaff || !isValidStaff.isValidNow) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff info not found');
    }
    const validStaffRole = ['STAFF_ADMIN'];
    if (!validStaffRole.includes(isValidStaff.role)) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff role not valid');
    }
    orgId = isValidStaff.organization.id;
  } else {
    const isValidUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!isValidUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    orgId = isValidUser.organizationId;
  }

  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    const result = await prisma.feedback.findMany({
      include: { Organization: true, product: true },
    });
    return result;
  } else {
    if (!orgId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
    }
    const result = await prisma.feedback.findMany({
      where: { organizationId: orgId },
      include: { Organization: true, product: true },
    });
    return result;
  }
};

const getSingle = async (feedbackId: string): Promise<Feedback | null> => {
  const result = await prisma.feedback.findUnique({
    where: { id: feedbackId },
    include: {
      Organization: {
        include: {
          owner: {
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
          },
        },
      },
      product: {
        include: {
          organization: {
            include: {
              owner: {
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
              },
            },
          },
          images: true,
          category: true,
          feedbacks: true,
        },
      },
    },
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Feedback not found');
  }
  return result;
};

const updateSingle = async (
  userId: string,
  role: string,
  feedbackId: string,
  payload: IFeedbackUpdate,
): Promise<Feedback | null> => {
  if (payload.rating && payload.rating > 5) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Rating is not more than 5');
  }
  const isFeedbackExist = await prisma.feedback.findUnique({
    where: { id: feedbackId },
  });
  if (!isFeedbackExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Feedback not found');
  }

  let orgId = null;

  if (role === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: {
        organization: true,
      },
    });
    if (!isValidStaff || !isValidStaff.isValidNow) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff info not found');
    }
    const validStaffRole = ['STAFF_ADMIN'];
    if (!validStaffRole.includes(isValidStaff.role)) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff role not valid');
    }
    orgId = isValidStaff.organization.id;
  } else {
    const isValidUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!isValidUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    orgId = isValidUser.organizationId;
  }
  if (!orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }

  if (orgId !== isFeedbackExist.organizationId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You can not change others feedback',
    );
  }

  const result = await prisma.feedback.update({
    where: { id: feedbackId },
    data: { ...payload },
  });
  return result;
};
const deleteSingle = async (
  userId: string,

  role: string,
  feedbackId: string,
): Promise<Feedback | null> => {
  const isFeedbackExist = await prisma.feedback.findUnique({
    where: { id: feedbackId },
  });
  if (!isFeedbackExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Feedback not found');
  }
  let orgId = null;

  if (role === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: {
        organization: true,
      },
    });
    if (!isValidStaff || !isValidStaff.isValidNow) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff info not found');
    }
    const validStaffRole = ['STAFF_ADMIN'];
    if (!validStaffRole.includes(isValidStaff.role)) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff role not valid');
    }
    orgId = isValidStaff.organization.id;
  } else {
    const isValidUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!isValidUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    orgId = isValidUser.organizationId;
  }
  if (!orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Owner info not found');
  }

  if (orgId !== isFeedbackExist.organizationId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You can not delete others feedback',
    );
  }

  const result = await prisma.feedback.delete({
    where: { id: feedbackId },
  });
  return result;
};

export const FeedbackService = {
  createNew,
  getAll,
  getSingle,
  updateSingle,
  deleteSingle,
};
