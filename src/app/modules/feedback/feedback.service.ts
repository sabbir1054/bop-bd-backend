import { Feedback } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const createNew = async (id: string, payload: Feedback): Promise<Feedback> => {
  const { userId, productId, rating, comment } = payload;
  if (id !== userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User id not match');
  }
  const isProductExist = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!isProductExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product does not exist');
  }
  const orders = await prisma.order.findMany({
    where: {
      customerId: userId,
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
      userId: userId,
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
      user: { connect: { id: userId } },
      product: { connect: { id: productId } },
    },
  });
  return result;
};

export const FeedbackService = {
  createNew,
};
