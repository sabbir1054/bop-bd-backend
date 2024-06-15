import { Cart } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const updateCartSingle = async (
  userId: string,
  productId: string,
  action: 'increment' | 'decrement',
): Promise<Cart | null> => {
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
      if (action === 'decrement') {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Cart not found for decrement action',
        );
      } else {
        cart = await prisma.cart.create({
          data: { userId: userId },
          include: { CartItem: true },
        });
      }
    }

    let cartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart?.id,
        productId: productId,
      },
    });

    if (cartItem) {
      if (action === 'increment') {
        cartItem = await prisma.cartItem.update({
          where: { id: cartItem.id },
          data: { quantity: { increment: 1 } },
        });
      } else if (action === 'decrement') {
        if (cartItem.quantity > 1) {
          cartItem = await prisma.cartItem.update({
            where: { id: cartItem.id },
            data: { quantity: { decrement: 1 } },
          });
        } else {
          await prisma.cartItem.delete({
            where: { id: cartItem.id },
          });
        }
      }
    } else {
      if (action === 'increment') {
        cartItem = await prisma.cartItem.create({
          data: {
            cart: { connect: { id: cart?.id } },
            product: { connect: { id: productId } },
            quantity: 1,
          },
        });
      } else {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Cart item not found for decrement action',
        );
      }
    }

    return prisma.cart.findUnique({
      where: { id: cart?.id },
      include: { CartItem: true },
    });
  });

  return result;
};

const updateCartMultiple = async (
  userId: string,
  productId: string,
  action: 'increment' | 'decrement',
  quantity: number,
): Promise<Cart | null> => {
  if (quantity <= 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Quantity must be greater than 0',
    );
  }

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
      if (action === 'decrement') {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Cart not found for decrement action',
        );
      } else {
        cart = await prisma.cart.create({
          data: { userId: userId },
          include: { CartItem: true },
        });
      }
    }

    let cartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart?.id,
        productId: productId,
      },
    });

    if (cartItem) {
      if (action === 'increment') {
        cartItem = await prisma.cartItem.update({
          where: { id: cartItem.id },
          data: { quantity: { increment: quantity } },
        });
      } else if (action === 'decrement') {
        if (cartItem.quantity > quantity) {
          cartItem = await prisma.cartItem.update({
            where: { id: cartItem.id },
            data: { quantity: { decrement: quantity } },
          });
        } else {
          await prisma.cartItem.delete({
            where: { id: cartItem.id },
          });
        }
      }
    } else {
      if (action === 'increment') {
        cartItem = await prisma.cartItem.create({
          data: {
            cart: { connect: { id: cart?.id } },
            product: { connect: { id: productId } },
            quantity: quantity,
          },
        });
      } else {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Cart item not found for decrement action',
        );
      }
    }

    return prisma.cart.findUnique({
      where: { id: cart?.id },
      include: { CartItem: true },
    });
  });

  return result;
};

const removeItemsFromCart = async (userId: string, cartItemIds: string[]) => {
  const cartItems = await prisma.cartItem.findMany({
    where: {
      id: {
        in: cartItemIds,
      },
    },
    include: {
      cart: true,
    },
  });

  if ((cartItems[0] && cartItems[0].cart.userId) !== userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You can't change other cart");
  }

  if (cartItems.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart items not found');
  }

  const deletedItems = await prisma.$transaction(async prisma => {
    const deletePromises = cartItems.map(cartItem =>
      prisma.cartItem.delete({
        where: { id: cartItem.id },
      }),
    );
    await Promise.all(deletePromises);

    return cartItems;
  });

  return deletedItems;
};
export const CartServices = {
  updateCartSingle,
  updateCartMultiple,
  removeItemsFromCart,
};
