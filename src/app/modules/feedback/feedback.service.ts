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
  let ownerId = null;

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: id },
      include: {
        organization: true,
      },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff info not found');
    }
    const validStaffRole = ['STAFF_ADMIN'];
    if (!validStaffRole.includes(isValidStaff.role)) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff role not valid');
    }
    ownerId = isValidStaff.organization.ownerId;
  } else {
    ownerId = id;
  }

  if (!ownerId) {
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
      customerId: ownerId,
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
      userId: ownerId,
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
      user: { connect: { id: ownerId } },
      product: { connect: { id: productId } },
    },
  });
  return result;
};

const getAll = async (role: string, userId: string): Promise<Feedback[]> => {
  let ownerId = null;

  if (role === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: {
        organization: true,
      },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff info not found');
    }
    const validStaffRole = ['STAFF_ADMIN'];
    if (!validStaffRole.includes(isValidStaff.role)) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff role not valid');
    }
    ownerId = isValidStaff.organization.ownerId;
  } else {
    ownerId = userId;
  }

  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    const result = await prisma.feedback.findMany({
      include: { user: true, product: true },
    });
    return result;
  } else {
    if (!ownerId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Owner info not found');
    }
    const result = await prisma.feedback.findMany({
      where: { userId: ownerId },
      include: { user: true, product: true },
    });
    return result;
  }
};

const getSingle = async (feedbackId: string): Promise<Feedback | null> => {
  const result = await prisma.feedback.findUnique({
    where: { id: feedbackId },
    include: {
      user: {
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
          shop_name: true,
          createdAt: true,
          updatedAt: true,
          feedbacks: true,
          businessType: true,
          businessTypeId: true,
        },
      },
      product: {
        include: {
          owner: {
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
              shop_name: true,
              createdAt: true,
              updatedAt: true,
              feedbacks: true,
              businessType: true,
              businessTypeId: true,
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

  let ownerId = null;

  if (role === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: {
        organization: true,
      },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff info not found');
    }
    const validStaffRole = ['STAFF_ADMIN'];
    if (!validStaffRole.includes(isValidStaff.role)) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff role not valid');
    }
    ownerId = isValidStaff.organization.ownerId;
  } else {
    ownerId = userId;
  }

  if (ownerId !== isFeedbackExist.userId) {
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
  let ownerId = null;

  if (role === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: {
        organization: true,
      },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff info not found');
    }
    const validStaffRole = ['STAFF_ADMIN'];
    if (!validStaffRole.includes(isValidStaff.role)) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff role not valid');
    }
    ownerId = isValidStaff.organization.ownerId;
  } else {
    ownerId = userId;
  }
  if (!ownerId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Owner info not found');
  }

  if (ownerId !== isFeedbackExist.userId) {
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
