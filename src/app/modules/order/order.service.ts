import { Order, OrderStatus, PaymentStatus } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { orderCodeGenerator } from '../../../helpers/orderIdcodeGenerator';
import { generateOTP, sendOTP } from '../../../helpers/otpHelpers';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { ordersSearchableFields } from './order.constant';
import { IOrderCreate } from './order.interface';

const orderCreate = async (
  userId: string,
  userRole: string,
  orderData: IOrderCreate,
): Promise<Order[]> => {
  const { shipping_address } = orderData;
  let cartId = null;
  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: {
        organization: { include: { owner: { include: { cart: true } } } },
      },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
    }
    if (isValidStaff.role !== ('PURCHASE_OFFICER' || 'STAFF_ADMIN')) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only store purchase officer or admin make order',
      );
    }
    cartId = isValidStaff.organization.owner.cart[0].id;
  } else {
    const isValidUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { cart: true },
    });
    if (!isValidUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Not valid user');
    }
    cartId = isValidUser?.cart[0].id;
  }
  if (!cartId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart information not found');
  }

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
        user: true, // Include user information to get the user's phone number
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

      // Generate a unique order code
      let orderCode;
      let isUnique = false;

      do {
        orderCode = orderCodeGenerator(
          cart.user.phone,
          items[0].product.owner.phone,
        );
        const existingOrder = await prisma.order.findUnique({
          where: { orderCode },
        });
        if (!existingOrder) {
          isUnique = true;
        }
      } while (!isUnique);

      // Create the order
      const order = await prisma.order.create({
        data: {
          orderCode, // Add the generated order code here
          shipping_address: shipping_address,
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

const getUserIncomingOrders = async (
  ownerId: string,
  options: IPaginationOptions,
): Promise<IGenericResponse<Order[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const result = await prisma.order.findMany({
    where: { product_seller_id: ownerId },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
    include: {
      customer: {
        select: {
          id: true,
          role: true,
          email: true,
          license: true,
          nid: true,
          memberCategory: true,
          verified: true,
          name: true,
          phone: true,
          address: true,
          photo: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      orderItems: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User incoming order not found');
  }
  const total = await prisma.order.count({
    where: { product_seller_id: ownerId },
  });
  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};
const getUserOutgoingOrders = async (
  userId: string,
  options: IPaginationOptions,
): Promise<IGenericResponse<Order[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const result = await prisma.order.findMany({
    where: { customerId: userId },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
    include: {
      product_seller: {
        select: {
          id: true,
          role: true,
          email: true,
          license: true,
          nid: true,
          memberCategory: true,
          verified: true,
          name: true,
          phone: true,
          address: true,
          photo: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User incoming order not found');
  }

  const total = await prisma.order.count({
    where: { customerId: userId },
  });
  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getOrganizationIncomingOrders = async (
  organizationId: string,
  options: IPaginationOptions,
): Promise<IGenericResponse<Order[]>> => {
  const isValidOrganization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });
  if (!isValidOrganization) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organizaion info not found');
  }
  const ownerId = isValidOrganization.ownerId;
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const result = await prisma.order.findMany({
    where: { product_seller_id: ownerId },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
    include: {
      customer: {
        select: {
          id: true,
          role: true,
          email: true,
          license: true,
          nid: true,
          memberCategory: true,
          verified: true,
          name: true,
          phone: true,
          address: true,
          photo: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      orderItems: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User incoming order not found');
  }
  const total = await prisma.order.count({
    where: { product_seller_id: ownerId },
  });
  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};
const getOrganizationOutgoingOrders = async (
  organizationId: string,
  options: IPaginationOptions,
): Promise<IGenericResponse<Order[]>> => {
  const isValidOrganization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });
  if (!isValidOrganization) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organizaion info not found');
  }
  const userId = isValidOrganization.ownerId;
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const result = await prisma.order.findMany({
    where: { customerId: userId },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
    include: {
      product_seller: {
        select: {
          id: true,
          role: true,
          email: true,
          license: true,
          nid: true,
          memberCategory: true,
          verified: true,
          name: true,
          phone: true,
          address: true,
          photo: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User incoming order not found');
  }

  const total = await prisma.order.count({
    where: { customerId: userId },
  });
  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const updateOrderStatus = async (
  userId: string,
  userRole: string,
  orderId: string,
  status: OrderStatus,
): Promise<Order> => {
  const isExistOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
    },
  });

  if (!isExistOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not exist ');
  }
  const customerPhone = isExistOrder.customer.phone;

  let ownerId = null;
  //* here ensure only owner,staff admin,order supervisor, delivery boy update status
  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { organization: true },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
    }

    if (
      isValidStaff.role !==
      ('ORDER_SUPERVISOR' || 'STAFF_ADMIN' || 'DELIVERY_BOY')
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'You are not able to change order status',
      );
    }
    ownerId = isValidStaff.organization.ownerId;
  } else {
    ownerId = userId;
  }

  if (ownerId !== isExistOrder.product_seller_id) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Only order supervisor and staff admin can change the status',
    );
  }
  //* here ensure that Ddelivered status update by only staff admin and delivery boy
  if (status === 'DELIVERED') {
    // confirm staff role
    let staffRole = null;
    if (userRole === 'STAFF') {
      const isValidStaff = await prisma.staff.findUnique({
        where: { staffInfoId: userId },
        include: { organization: true },
      });
      staffRole = isValidStaff?.role;
      if (isValidStaff?.role !== ('DELIVERY_BOY' || 'STAFF_ADMIN')) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Only delivery boy change status to delivered',
        );
      }
    }
    if (staffRole === 'DELIVERY_BOY') {
      //* order delivery update with verification by delivery boy
      const result = await prisma.$transaction(async prisma => {
        const otp = generateOTP();
        const sendOtp = await sendOTP(
          customerPhone,
          otp,
          `From BOP-BD, Your order delivery verification code is ${otp}`,
        );

        if (sendOtp == null || sendOtp.Status != 0) {
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Otp not send please try again',
          );
        }

        const makeOtpForUser = await prisma.oneTimePassword.create({
          data: {
            phone: customerPhone,
            otpCode: otp,
            checkCounter: 0,
            resendCounter: 0,
          },
        });

        if (!makeOtpForUser) {
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Otp not set');
        }
        const result = await prisma.order.update({
          where: { id: orderId },
          data: { orderStatus: status },
        });

        return result;
      });
      return result;
    } else {
      //* order delivery update without verification by staff admin
      const result = await prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: status },
      });

      return result;
    }
  } else {
    //* here ensure orders others status update by owner admin and order supervisor
    if (userRole === 'STAFF') {
      const isValidStaff = await prisma.staff.findUnique({
        where: { staffInfoId: userId },
        include: { organization: true },
      });

      if (isValidStaff?.role === 'DELIVERY_BOY') {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Delivery boy not change other order status',
        );
      }
    }
    const result = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: status },
    });

    return result;
  }
};

const updatePaymentStatus = async (
  userId: string,
  orderId: string,
  status: PaymentStatus,
): Promise<Order> => {
  const isExistOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!isExistOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not exist ');
  }
  if (userId !== isExistOrder.product_seller_id) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Only product seller can change the status',
    );
  }
  const result = await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: status },
  });

  return result;
};
const getSingle = async (id: string): Promise<Order | null> => {
  const result = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          role: true,
          memberCategory: true,
          verified: true,
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
      product_seller: {
        select: {
          id: true,
          role: true,
          memberCategory: true,
          verified: true,
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
          businessType: true,
          businessTypeId: true,
        },
      },
      orderItems: {
        include: {
          product: {
            include: {
              images: true,
              category: true,
              feedbacks: true,
            },
          },
        },
      },
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order doesnt exist');
  }
  return result;
};

const searchFilterIncomingOrders = async (
  userId: string,
  userRole: string,
  filters: any,
  options: IPaginationOptions,
): Promise<IGenericResponse<Order[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, phone, ...filtersData } = filters;
  const andConditions: any[] = [];

  let ownerId = null;

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { organization: true },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
    }
    if (isValidStaff.role !== ('ORDER_SUPERVISOR' || 'STAFF_ADMIN')) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'You are not allowed to see incoming orders',
      );
    }
    ownerId = isValidStaff.organization.ownerId;
  } else {
    ownerId = userId;
  }

  if (searchTerm) {
    andConditions.push({
      OR: ordersSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }
  if (phone) {
    andConditions.push({
      customer: {
        phone: {
          contains: phone,
          mode: 'insensitive',
        },
      },
    });
  }
  if (Object.keys(filtersData).length) {
    const conditions = Object.entries(filtersData).map(([field, value]) => ({
      [field]: value,
    }));
    andConditions.push({ AND: conditions });
  }

  //* Add condition for ownerId
  andConditions.push({
    product_seller_id: ownerId,
  });

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.order.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  });
  const total = await prisma.order.count({
    where: whereConditions,
  });
  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};
const searchFilterOutgoingOrders = async (
  userId: string,
  userRole: string,
  filters: any,
  options: IPaginationOptions,
): Promise<IGenericResponse<Order[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, phone, ...filtersData } = filters;
  const andConditions: any[] = [];

  let ownerId = null;

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { organization: true },
    });
    if (!isValidStaff) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
    }
    if (
      isValidStaff.role !==
      ('PURCHASE_OFFICER' || 'ORDER_SUPERVISOR' || 'STAFF_ADMIN')
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'You are not allowed to see outgoing orders',
      );
    }
    ownerId = isValidStaff.organization.ownerId;
  } else {
    ownerId = userId;
  }

  if (searchTerm) {
    andConditions.push({
      OR: ordersSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }
  if (phone) {
    andConditions.push({
      product_seller: {
        phone: {
          contains: phone,
          mode: 'insensitive',
        },
      },
    });
  }
  if (Object.keys(filtersData).length) {
    const conditions = Object.entries(filtersData).map(([field, value]) => ({
      [field]: value,
    }));
    andConditions.push({ AND: conditions });
  }

  //* Add condition for ownerId
  andConditions.push({
    customerId: ownerId,
  });

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.order.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  });
  const total = await prisma.order.count({
    where: whereConditions,
  });
  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

export const OrderService = {
  orderCreate,
  getUserIncomingOrders,
  getUserOutgoingOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getSingle,
  searchFilterIncomingOrders,
  searchFilterOutgoingOrders,
  getOrganizationOutgoingOrders,
  getOrganizationIncomingOrders,
};
