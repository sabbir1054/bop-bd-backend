import { Order } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { IOrderCreate } from './order.interface';

const orderCreate = async (orderData: IOrderCreate): Promise<Order> => {
  const { cartId } = orderData;

  const result = await prisma.$transaction(async prisma => {
    //* Fetch cart details including items
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        CartItem: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `Cart with id ${cartId} not found.`,
      );
    }

    const orderItemsData = cart.CartItem.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    //* Create a map of product prices
    const productIds = orderItemsData.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        price: true,
        discount_price: true,
      },
    });

    const productPriceMap = products.reduce(
      (acc, product) => {
        acc[product.id] = product.discount_price ?? product.price;
        return acc;
      },
      {} as { [key: string]: number },
    );

    //* Calculate the total order amount using the discount price if available
    const total = orderItemsData.reduce((acc, item) => {
      const price = productPriceMap[item.productId];
      return acc + price * item.quantity;
    }, 0);

    // Create the order
    const order = await prisma.order.create({
      data: {
        total,
        customer: {
          connect: { id: cart.userId },
        },
        orderItems: {
          create: orderItemsData.map(item => ({
            product: {
              connect: { id: item.productId },
            },
            quantity: item.quantity,
            price: productPriceMap[item.productId],
          })),
        },
      },
    });

    //* Empty the cart
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return order;
  });

  return result;
};

export const OrderService = {
  orderCreate,
};
