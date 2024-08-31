import { Cart } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const updateCartSingle = async (
  userId: string,
  userRole: string,
  productId: string,
  action: 'increment' | 'decrement',
): Promise<Cart | null> => {
  const isProductExist = await prisma.product.findUnique({
    where: { id: productId },
    include: { organization: true },
  });

  if (!isProductExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  let orgId = null;

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { organization: true },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
    }
    const validPurchaseRole = ['PURCHASE_OFFICER', 'STAFF_ADMIN'];
    if (!validPurchaseRole.includes(isValidStaff.role)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only puchase officer or admin change cart',
      );
    }
    orgId = isValidStaff.organization.id;
  } else {
    const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
    if (!isUserExist) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    orgId = isUserExist.organizationId;
  }
  if (!orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }
  const organizationInfo = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { owner: true },
  });
  const isValidOwner = await prisma.user.findUnique({
    where: { id: organizationInfo?.owner.id },
  });
  if (!isValidOwner?.verified) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Organization is not verified');
  }

  if (orgId === isProductExist.organizationId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You can not add your product in the cart',
    );
  }

  const result = await prisma.$transaction(async prisma => {
    let cart = await prisma.cart.findFirst({
      where: { organizationId: orgId },
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
          data: { organizationId: orgId },
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
  userRole: string,
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

  let orgId = null;

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { organization: true },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
    }
    if (isValidStaff.role !== ('PURCHASE_OFFICER' || 'STAFF_ADMIN')) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only store purchase officer or admin delete the product image',
      );
    }
    orgId = isValidStaff.organization.id;
  } else {
    const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
    if (!isUserExist) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    orgId = isUserExist.organizationId;
  }

  if (!orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }
  const organizationInfo = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { owner: true },
  });
  const isValidOwner = await prisma.user.findUnique({
    where: { id: organizationInfo?.owner.id },
  });
  if (!isValidOwner?.verified) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Organization is not verified');
  }

  if (orgId === isProductExist.organizationId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You can not add your product in the cart',
    );
  }

  const result = await prisma.$transaction(async prisma => {
    let cart = await prisma.cart.findFirst({
      where: { organizationId: orgId },
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
          data: { organizationId: orgId },
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

const removeItemsFromCart = async (
  userId: string,
  userRole: string,
  cartItemIds: string[],
) => {
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
  let orgId = null;

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { organization: true },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
    }
    if (isValidStaff.role !== ('PURCHASE_OFFICER' || 'STAFF_ADMIN')) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only store manager or admin delete the product image',
      );
    }
    orgId = isValidStaff.organization;
  } else {
    const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
    if (!isUserExist) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    orgId = isUserExist.organizationId;
  }

  if ((cartItems[0] && cartItems[0].cart.organizationId) !== orgId) {
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

const getMyCart = async (userId: string, userRole: string) => {
  let orgId = null;

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { organization: true },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
    }
    if (isValidStaff.role !== ('PURCHASE_OFFICER' || 'STAFF_ADMIN')) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only store manager or admin delete the product image',
      );
    }
    orgId = isValidStaff.organization.id;
  } else {
    const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
    if (!isUserExist) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    orgId = isUserExist.organizationId;
  }
  if (!orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }
  const organizationCart = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      cart: {
        include: {
          CartItem: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!organizationCart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const result = organizationCart.cart;
  return result;
};

const getSingleUserCart = async (userId: string) => {
  const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (!isUserExist.organizationId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User organization not found');
  }
  const isOrganizationExist = await prisma.organization.findUnique({
    where: { id: isUserExist?.organizationId },
    include: {
      cart: {
        include: {
          CartItem: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!isOrganizationExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization not found');
  }
  const result = isOrganizationExist.cart;
  return result;
};

export const CartServices = {
  updateCartSingle,
  updateCartMultiple,
  removeItemsFromCart,
  getMyCart,
  getSingleUserCart,
};
