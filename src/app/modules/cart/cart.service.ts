import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
const addToCartSingle = async (userId: string, productId: string) => {
  const isProductExist = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!isProductExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  const result = await prisma.$transaction(async prisma => {
    let cart = await prisma.cart.findFirst({
      where: { userId: userId },
      include: { CartItem: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: userId },
        include: { CartItem: true },
      });
    }

    let cartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart?.id,
        productId: productId,
      },
    });

    if (cartItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity: { increment: 1 } },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cart: { connect: { id: cart?.id } },
          product: { connect: { id: productId } },
          quantity: 1,
        },
      });
    }

    return prisma.cart.findUnique({
      where: { id: cart?.id },
      include: { CartItem: true },
    });
  });

  return result;
};

export const CartServices = {
  addToCartSingle,
};
