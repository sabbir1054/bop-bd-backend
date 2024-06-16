import { Order } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { IOrderCreate } from './order.interface';

// const orderCreate = async (orderData: IOrderCreate): Promise<Order> => {
//   const { cartId } = orderData;

//   const result = await prisma.$transaction(async prisma => {
//     //* Fetch cart details including items
//     const cart = await prisma.cart.findUnique({
//       where: { id: cartId },
//       include: {
//         CartItem: {
//           include: {
//             product: true,
//           },
//         },
//       },
//     });

//     if (!cart) {
//       throw new ApiError(
//         httpStatus.NOT_FOUND,
//         `Cart with id ${cartId} not found.`,
//       );
//     }

//     const orderItemsData = cart.CartItem.map(item => ({
//       productId: item.productId,
//       quantity: item.quantity,
//     }));

//     //* Create a map of product prices
//     const productIds = orderItemsData.map(item => item.productId);
//     const products = await prisma.product.findMany({
//       where: {
//         id: { in: productIds },
//       },
//       select: {
//         id: true,
//         price: true,
//         discount_price: true,
//       },
//     });

//     const productPriceMap = products.reduce(
//       (acc, product) => {
//         acc[product.id] = product.discount_price ?? product.price;
//         return acc;
//       },
//       {} as { [key: string]: number },
//     );

//     //* Calculate the total order amount using the discount price if available
//     const total = orderItemsData.reduce((acc, item) => {
//       const price = productPriceMap[item.productId];
//       return acc + price * item.quantity;
//     }, 0);

//     // Create the order
//     const order = await prisma.order.create({
//       data: {
//         total,
//         customer: {
//           connect: { id: cart.userId },
//         },
//         orderItems: {
//           create: orderItemsData.map(item => ({
//             product: {
//               connect: { id: item.productId },
//             },
//             quantity: item.quantity,
//             price: productPriceMap[item.productId],
//           })),
//         },
//       },
//     });

//     //* Empty the cart
//     await prisma.cartItem.deleteMany({
//       where: {
//         cartId: cart.id,
//       },
//     });

//     return order;
//   });

//   return result;
// };
const orderCreate = async (orderData: IOrderCreate): Promise<Order[]> => {
  const { cartId } = orderData;

  const result = await prisma.$transaction(async prisma => {
    // Fetch cart details including items
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        CartItem: {
          include: {
            product: {
              include: {
                owner: true,
              },
            },
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

    // Filter out items where the product owner is the same as the cart user
    const validCartItems = cart.CartItem.filter(
      item => item.product.ownerId !== cart.userId,
    );

    if (validCartItems.length === 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `You cannot buy your own products.`,
      );
    }

    // Create a map of product prices
    const productIds = validCartItems.map(item => item.productId);
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

    // Group valid cart items by product owner
    const groupedByOwner = validCartItems.reduce(
      (acc, item) => {
        const ownerId = item.product.ownerId;
        if (!acc[ownerId]) {
          acc[ownerId] = [];
        }
        acc[ownerId].push(item);
        return acc;
      },
      {} as { [key: string]: typeof validCartItems },
    );

    const createdOrders = [];

    // Create separate orders for each product owner
    for (const [ownerId, items] of Object.entries(groupedByOwner)) {
      const orderItemsData = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: productPriceMap[item.productId],
      }));

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
          product_seller: {
            connect: { id: ownerId },
          },
          orderItems: {
            create: orderItemsData.map(item => ({
              product: {
                connect: { id: item.productId },
              },
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });

      createdOrders.push(order);
    }

    // Empty the cart
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return createdOrders;
  });

  return result;
};

export const OrderService = {
  orderCreate,
};
