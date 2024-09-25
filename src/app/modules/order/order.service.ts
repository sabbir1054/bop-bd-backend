import { Order, OrderStatus, PaymentStatus } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { orderCodeGenerator } from '../../../helpers/orderIdcodeGenerator';
import { generateOTP, sendOTP } from '../../../helpers/otpHelpers';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { isCodeValid } from '../../../helpers/referCodeValidity';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import {
  ordersSearchableFields,
  validStaffRoleForOrderStatusUpdate,
} from './order.constant';
import {
  IDeliveryAssignData,
  IOrderCreate,
  IUpdateOrderPaymentOptions,
  IVerificationDeliveryPayload,
} from './order.interface';
const orderCreate = async (
  userId: string,
  userRole: string,
  orderData: IOrderCreate,
): Promise<Order[]> => {
  const { shipping_address } = orderData;
  let cartId = null;

  // Determine the user's role and validate accordingly
  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: {
        organization: { include: { cart: true } },
      },
    });
    if (!isValidStaff || !isValidStaff.isValidNow) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
    }
    if (
      isValidStaff.role === 'PURCHASE_OFFICER' ||
      isValidStaff.role === 'STAFF_ADMIN'
    ) {
      cartId = isValidStaff.organization.cart[0].id;
    } else {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only store purchase officer or admin make order',
      );
    }
  } else {
    const isValidUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: { include: { cart: true } } },
    });
    if (!isValidUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Not valid user');
    }
    if (!isValidUser?.organization?.cart[0].id) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cart info not found');
    }
    cartId = isValidUser?.organization?.cart[0].id;
  }

  if (!cartId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart information not found');
  }

  // Fetch cart details before transaction
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      CartItem: {
        include: {
          product: {
            include: {
              organization: { include: { owner: true } },
            },
          },
        },
      },
      Organization: { include: { owner: true } }, // Include user information to get the user's phone number
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
    item => item.product.organizationId !== cart.organizationId,
  );

  if (validCartItems.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `You cannot buy your own products.`,
    );
  }

  //check paymentoptions id

  // Begin transaction after ensuring valid cart items
  const result = await prisma.$transaction(async prisma => {
    // Proceed with valid cart items to create orders
    const productIds = validCartItems.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        price: true,
        discount_price: true,
        stock: true, // Include stock to check availability
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
        const orgId = item.product.organizationId;
        if (!acc[orgId]) {
          acc[orgId] = [];
        }
        acc[orgId].push(item);
        return acc;
      },
      {} as { [key: string]: typeof validCartItems },
    );

    const createdOrders: any = [];

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
      if (!cart?.Organization || !cart?.organizationId) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
      }
      do {
        orderCode = orderCodeGenerator(
          cart?.Organization?.owner?.phone,
          items[0].product.organization.owner.phone,
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
          totalWithDeliveryCharge: total,
          customer: {
            connect: { id: cart?.organizationId },
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
          orderPaymentInfo: {
            include: {
              paymentSystemOptions: true,
            },
          },
          customer: true,
          product_seller: {
            include: { UsedReffereCode: { include: { refferCode: true } } },
          },
        },
      });

      createdOrders.push(order);

      // ** Reduce stock after order creation **
      for (const item of orderItemsData) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          throw new ApiError(httpStatus.NOT_FOUND, 'Product info not found');
        }
        if (product.stock < item.quantity) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Not enough stock for product ${item.productId}`,
          );
        }

        // Reduce the stock of the product
        await prisma.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.quantity, // Reduce stock by the quantity ordered
            },
          },
        });
      }
    }

    // Empty the cart after order is placed
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return createdOrders;
  });

  return result;
};

const getOrganizationIncomingOrders = async (
  organizationId: string,
  options: IPaginationOptions,
): Promise<IGenericResponse<Order[]>> => {
  const isExistrganization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });
  if (!organizationId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const result = await prisma.order.findMany({
    where: { product_seller_id: organizationId },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
    include: {
      orderPaymentInfo: { include: { paymentSystemOptions: true } },
      assigndForDelivery: true,
      customer: {
        include: {
          owner: {
            select: {
              id: true,
              role: true,
              email: true,
              license: true,
              nid: true,
              verified: true,
              organization: true,
              isMobileVerified: true,
              name: true,
              phone: true,
              address: true,
              photo: true,
              createdAt: true,
              updatedAt: true,
            },
          },
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
    where: { product_seller_id: organizationId },
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
//! here change it was owner id now it is organization id
const getOrganizationOutgoingOrders = async (
  organizationId: string,
  options: IPaginationOptions,
): Promise<IGenericResponse<Order[]>> => {
  const isExistrganization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });
  if (!organizationId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const result = await prisma.order.findMany({
    where: { customerId: organizationId },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
    include: {
      orderPaymentInfo: { include: { paymentSystemOptions: true } },
      assigndForDelivery: true,
      product_seller: {
        include: {
          owner: {
            select: {
              id: true,
              role: true,
              email: true,
              license: true,
              nid: true,
              verified: true,
              organization: true,
              isMobileVerified: true,
              name: true,
              phone: true,
              address: true,
              photo: true,
              createdAt: true,
              updatedAt: true,
            },
          },
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
    where: { customerId: organizationId },
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
) => {
  const isExistOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: { include: { owner: true } },
      product_seller: {
        include: { UsedReffereCode: { include: { refferCode: true } } },
      },
    },
  });

  if (!isExistOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not exist ');
  }

  if (status === 'SHIPPING' && !isExistOrder.deliveryCharge) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'At first set delivery charge it can be minimum 0',
    );
  }
  const customerPhone = isExistOrder.customer.owner.phone;

  let orgId = null;
  //* here ensure only owner,staff admin,order supervisor, delivery boy update status
  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { organization: true },
    });
    if (!isValidStaff || !isValidStaff.isValidNow) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
    }

    if (!validStaffRoleForOrderStatusUpdate.includes(isValidStaff.role)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'You are not able to change order status',
      );
    }
    orgId = isValidStaff.organization.id;
  } else {
    const userInfo = await prisma.user.findUnique({ where: { id: userId } });
    if (!userInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'user Info not found');
    }
    orgId = userInfo.organizationId;
  }

  if (orgId !== isExistOrder.product_seller_id) {
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

      if (!isValidStaff || !isValidStaff.isValidNow) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Only delivery boy change status to delivered',
        );
      }
      staffRole = isValidStaff?.role;
      const validRole = ['DELIVERY_BOY', 'STAFF_ADMIN'];

      if (!validRole.includes(staffRole)) {
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

        const isExistOrderOtp = await prisma.orderOtp.findFirst({
          where: { orderId: orderId },
        });

        if (isExistOrder) {
          const makeOtpForUser = await prisma.orderOtp.update({
            where: { orderId: isExistOrder.id },
            data: {
              otpCode: otp,
              countSend: { increment: 1 },
            },
          });

          if (!makeOtpForUser) {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Otp not set');
          }
          const result = { message: 'Otp send successfully' };

          return result;
        } else {
          const makeOtpForUser = await prisma.orderOtp.create({
            data: {
              phone: customerPhone,
              orderId: orderId,
              otpCode: otp,
              countSend: 1,
            },
          });

          if (!makeOtpForUser) {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Otp not set');
          }
          const result = { message: 'Otp send successfully' };

          return result;
        }
      });
      return result;
    } else {
      const result = await prisma.$transaction(async prisma => {
        //! calculate reward and commission
        //* start rearwd given
        const owner = isExistOrder.product_seller;
        const customer = isExistOrder.customer;
        let isValid = false;
        if (owner.UsedReffereCode) {
          isValid = isCodeValid(
            new Date(owner?.UsedReffereCode?.refferCode?.validUntil),
          );
        }

        let ownerCommissionType = 'NORMAL';
        if (isValid && owner?.UsedReffereCode?.refferCode?.isValid) {
          ownerCommissionType = 'REFERRED_MEMBER';
        }

        const commissionInfo = await prisma.commission.findFirst({
          where: {
            AND: [
              {
                membershipCategory:
                  isExistOrder.product_seller.memberShipCategory,
              },
              {
                commissionType:
                  ownerCommissionType === 'NORMAL'
                    ? 'NORMAL'
                    : 'REFERRED_MEMBER',
              },
            ],
          },
        });

        if (!commissionInfo) {
          throw new ApiError(httpStatus.NOT_FOUND, 'Commission info not found');
        }

        const calculatedCommission =
          isExistOrder.total * (commissionInfo.percentage / 100);

        await prisma.order_Commission_History.create({
          data: {
            orderId: isExistOrder.id,
            commissionId: commissionInfo.id,
            commissionAmount: calculatedCommission,
          },
        });
        await prisma.organization.update({
          where: { id: owner.id },
          data: {
            totalCommission: { increment: calculatedCommission },
          },
        });
        //* owner reward
        const ownerRewardInfo = await prisma.rewardPoints.findFirst({
          where: {
            AND: [
              { rewardType: 'SELLING' },
              { membershipCategory: owner.memberShipCategory },
            ],
          },
        });

        if (!ownerRewardInfo?.points) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            'No reward points defined',
          );
        }

        await prisma.organizationRewardPointsHistory.create({
          data: {
            pointHistoryType: 'IN',
            rewardPointsId: ownerRewardInfo?.id,
            points: ownerRewardInfo?.points,
            organizationId: owner.id,
          },
        });

        await prisma.organization.update({
          where: { id: owner.id },
          data: {
            totalRewardPoints: { increment: ownerRewardInfo?.points },
          },
        });

        //* customer reward
        const customerRewardInfo = await prisma.rewardPoints.findFirst({
          where: {
            AND: [
              { rewardType: 'BUYING' },
              { membershipCategory: customer.memberShipCategory },
            ],
          },
        });

        if (!customerRewardInfo?.points) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            'No reward points defined',
          );
        }

        await prisma.organizationRewardPointsHistory.create({
          data: {
            pointHistoryType: 'IN',
            rewardPointsId: customerRewardInfo?.id,
            points: customerRewardInfo?.points,
            organizationId: customer.id,
          },
        });

        await prisma.organization.update({
          where: { id: customer.id },
          data: {
            totalRewardPoints: { increment: customerRewardInfo?.points },
          },
        });
        //* order delivery update without verification by staff admin
        const result = await prisma.order.update({
          where: { id: orderId },
          data: { orderStatus: status },
        });

        return result;
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
      include: {
        assigndForDelivery: true,
      },
    });

    return result;
  }
};

const verifyDeliveryOtp = async (
  userId: string,
  userRole: string,
  payload: IVerificationDeliveryPayload,
) => {
  const isValidStaff = await prisma.staff.findUnique({
    where: { staffInfoId: userId },
    include: { organization: true },
  });
  if (!isValidStaff || !isValidStaff.isValidNow) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
  }
  if (isValidStaff.role !== 'DELIVERY_BOY') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You can not submit delivery verification code.',
    );
  }
  const isExistOrder = await prisma.order.findUnique({
    where: { id: payload.orderId },
    include: {
      customer: { include: { owner: true } },
      product_seller: {
        include: { UsedReffereCode: { include: { refferCode: true } } },
      },
    },
  });

  if (!isExistOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not exist ');
  }

  if (isExistOrder.product_seller_id !== isValidStaff.organizationId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Order owner id is not your organzation ',
    );
  }

  const customerPhone = isExistOrder.customer.owner.phone;

  const result = await prisma.$transaction(async prisma => {
    const findOtp = await prisma.orderOtp.findUnique({
      where: { orderId: isExistOrder.id, phone: customerPhone },
    });

    if (!findOtp) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Otp info not found');
    }

    if (findOtp.isVerified === true) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Delivery otp already verified',
      );
    }

    if (payload.givenOtp !== findOtp.otpCode) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Delivery otp not match');
    } else {
      await prisma.orderOtp.update({
        where: { orderId: isExistOrder.id, phone: customerPhone },
        data: {
          isVerified: true,
        },
      });
      //! calculate reward and commission
      //* start rearwd given
      const owner = isExistOrder.product_seller;
      const customer = isExistOrder.customer;
      let isValid = false;
      if (owner.UsedReffereCode) {
        isValid = isCodeValid(
          new Date(owner?.UsedReffereCode?.refferCode?.validUntil),
        );
      }

      let ownerCommissionType = 'NORMAL';
      if (isValid && owner?.UsedReffereCode?.refferCode?.isValid) {
        ownerCommissionType = 'REFERRED_MEMBER';
      }

      const commissionInfo = await prisma.commission.findFirst({
        where: {
          AND: [
            {
              membershipCategory:
                isExistOrder.product_seller.memberShipCategory,
            },
            {
              commissionType:
                ownerCommissionType === 'NORMAL' ? 'NORMAL' : 'REFERRED_MEMBER',
            },
          ],
        },
      });

      if (!commissionInfo) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Commission info not found');
      }

      const calculatedCommission =
        isExistOrder.total * (commissionInfo.percentage / 100);

      await prisma.order_Commission_History.create({
        data: {
          orderId: isExistOrder.id,
          commissionId: commissionInfo.id,
          commissionAmount: calculatedCommission,
        },
      });
      //* owner reward
      const ownerRewardInfo = await prisma.rewardPoints.findFirst({
        where: {
          AND: [
            { rewardType: 'SELLING' },
            { membershipCategory: owner.memberShipCategory },
          ],
        },
      });

      if (!ownerRewardInfo?.points) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'No reward points defined');
      }
      //* calculate reward
      if (!ownerRewardInfo.points) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          'Owner reward points info not found',
        );
      }
      const ownerCalculatedreward =
        isExistOrder.total * Math.round(ownerRewardInfo.points / 100);
      await prisma.organizationRewardPointsHistory.create({
        data: {
          pointHistoryType: 'IN',
          rewardPointsId: ownerRewardInfo?.id,
          points: ownerCalculatedreward,
          organizationId: owner.id,
        },
      });

      await prisma.organization.update({
        where: { id: owner.id },
        data: {
          totalRewardPoints: { increment: ownerCalculatedreward },
        },
      });

      //* customer reward
      const customerRewardInfo = await prisma.rewardPoints.findFirst({
        where: {
          AND: [
            { rewardType: 'BUYING' },
            { membershipCategory: customer.memberShipCategory },
          ],
        },
      });

      if (!customerRewardInfo?.points) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'No reward points defined');
      }
      const customerCalculatedreward =
        isExistOrder.total * Math.round(customerRewardInfo.points / 100);
      await prisma.organizationRewardPointsHistory.create({
        data: {
          pointHistoryType: 'IN',
          rewardPointsId: customerRewardInfo?.id,
          points: customerCalculatedreward,
          organizationId: customer.id,
        },
      });

      await prisma.organization.update({
        where: { id: customer.id },
        data: {
          totalRewardPoints: { increment: customerCalculatedreward },
        },
      });

      if (isExistOrder.paymentStatus === 'PAID') {
        const result = await prisma.order.update({
          where: { id: payload.orderId },
          data: { orderStatus: 'DELIVERED' },
        });
        return result;
      } else {
        const result = await prisma.order.update({
          where: { id: payload.orderId },
          data: { orderStatus: 'DELIVERED', paymentStatus: 'PAID' },
        });
        return result;
      }
    }
  });
  return result;
};
const updatePaymentStatus = async (
  userId: string,
  userRole: string,
  orderId: string,
  status: PaymentStatus,
): Promise<Order> => {
  const isExistOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!isExistOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not exist ');
  }

  let orgId = null;
  //* here ensure only owner,staff admin,order supervisor, delivery boy update status
  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { organization: true },
    });
    if (!isValidStaff || !isValidStaff.isValidNow) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
    }

    if (!validStaffRoleForOrderStatusUpdate.includes(isValidStaff.role)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'You are not able to change order status',
      );
    }
    orgId = isValidStaff.organization.id;
  } else {
    const userInfo = await prisma.user.findUnique({ where: { id: userId } });
    if (!userInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'user Info not found');
    }
    orgId = userInfo.organizationId;
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
      assigndForDelivery: {
        include: {
          deliveryBoy: {
            include: {
              staffInfo: true,
            },
          },
        },
      },
      OrderOtp: true,
      orderPaymentInfo: { include: { paymentSystemOptions: true } },
      customer: {
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
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
      product_seller: {
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
              createdAt: true,
              updatedAt: true,
            },
          },
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

  let orgId = null;

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { organization: true },
    });
    if (!isValidStaff || !isValidStaff.isValidNow) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
    }
    const validUser = ['ORDER_SUPERVISOR', 'STAFF_ADMIN'];
    if (validUser.includes(isValidStaff.role)) {
      orgId = isValidStaff.organization.id;
    } else {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'You are not allowed to see outgoing orders',
      );
    }
  } else {
    const userInfo = await prisma.user.findUnique({ where: { id: userId } });
    if (!userInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'user Info not found');
    }
    orgId = userInfo.organizationId;
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
    product_seller_id: orgId,
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
      OrderOtp: true,
      orderPaymentInfo: {
        include: {
          paymentSystemOptions: true,
        },
      },
      assigndForDelivery: true,
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

  let orgId = null;

  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
      include: { organization: true },
    });
    if (!isValidStaff || !isValidStaff.isValidNow) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff is invalid');
    }
    const validUser = ['PURCHASE_OFFICER', 'ORDER_SUPERVISOR', 'STAFF_ADMIN'];
    if (validUser.includes(isValidStaff.role)) {
      orgId = isValidStaff.organization.id;
    } else {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'You are not allowed to see outgoing orders',
      );
    }
  } else {
    const userInfo = await prisma.user.findUnique({ where: { id: userId } });
    if (!userInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'user Info not found');
    }
    orgId = userInfo.organizationId;
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
    customerId: orgId,
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
      OrderOtp: true,
      assigndForDelivery: true,
      orderPaymentInfo: { include: { paymentSystemOptions: true } },
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
const assignForDelivery = async (
  userId: string,
  userRole: string,
  payload: IDeliveryAssignData,
) => {
  let orgId = null;
  if (userRole === 'STAFF') {
    const IsValidUserRole = await prisma.user.findUnique({
      where: { id: userId },
      include: { Staff: { include: { organization: true } } },
    });

    if (
      !IsValidUserRole ||
      !IsValidUserRole.Staff ||
      !IsValidUserRole.Staff.isValidNow
    ) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }

    const validStaffRole = ['ORDER_SUPERVISOR', 'STAFF_ADMIN'];
    if (!validStaffRole.includes(IsValidUserRole.Staff.role)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only order supervisor and staff admin can assign delivery boy',
      );
    }
    orgId = IsValidUserRole.Staff.organizationId;
  } else {
    const isUserExist = await prisma.user.findUnique({ where: { id: userId } });
    if (!isUserExist) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    orgId = isUserExist.organizationId;
  }

  const isDeliveryBoyExist = await prisma.staff.findUnique({
    where: { id: payload.deliveryBoyId },
  });

  if (!isDeliveryBoyExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Delivery boy info not found');
  }
  if (isDeliveryBoyExist.role !== 'DELIVERY_BOY') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Please provide valid delivery boy id',
    );
  }
  if (!isDeliveryBoyExist.deliveryArea) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Delivery have not any specific area for percel delivery',
    );
  }

  const isOrderExist = await prisma.order.findUnique({
    where: { id: payload.orderId },
  });

  if (!isOrderExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order info not found');
  }

  if (isOrderExist.product_seller_id !== orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order id not valid ');
  }

  const result = await prisma.assigndForDelivery.create({
    data: {
      deliveryBoy: { connect: { id: payload.deliveryBoyId } },
      order: { connect: { id: payload.orderId } },
    },
  });

  return result;
};

const getMyOrderForDelivery = async (userId: string) => {
  const isValidStaff = await prisma.staff.findUnique({
    where: { staffInfoId: userId },
  });

  if (!isValidStaff || !isValidStaff.isValidNow) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Staff info not found');
  }

  if (isValidStaff.role !== 'DELIVERY_BOY') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Delivery boy only access it');
  }

  const result = await prisma.assigndForDelivery.findMany({
    where: { deliveryBoyId: isValidStaff.id },
    include: {
      order: {
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });
  return result;
};

const updateOrderPaymentOptions = async (
  userId: string,
  userRole: string,
  payload: IUpdateOrderPaymentOptions,
) => {
  let isSellerOrganization = null;
  let orgId = null;
  const isOrderExist = await prisma.order.findUnique({
    where: { id: payload.orderId },
    include: {
      customer: true,
      product_seller: {
        include: {
          PaymentSystemOptions: true,
        },
      },
      orderPaymentInfo: true,
    },
  });

  if (!isOrderExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order info not found');
  }

  if (userRole === 'STAFF') {
    const userInfo = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
    });
    if (!userInfo || !userInfo.isValidNow) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
    }
    if (userInfo.organizationId === isOrderExist.product_seller_id) {
      isSellerOrganization = true;
      orgId = userInfo.organizationId;
    }
    if (userInfo.organizationId === isOrderExist.customerId) {
      isSellerOrganization = false;
    }

    if (isSellerOrganization === null) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Please use authorized account');
    }
    const validStaff =
      isSellerOrganization === true
        ? ['STAFF_ADMIN', 'ORDER_SUPERVISOR']
        : ['STAFF_ADMIN', 'PURCHASE_OFFICER'];
    if (!validStaff.includes(userInfo.role)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Role staff');
    }
  }

  const isPaymentOptionsExist = await prisma.paymentSystemOptions.findFirst({
    where: {
      AND: [
        { id: payload.paymentSystemOptionsId },
        { organizationId: isOrderExist.product_seller_id },
      ],
    },
  });

  if (!isPaymentOptionsExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment options not found');
  }

  if (isOrderExist.orderPaymentInfo) {
    if (!isOrderExist.orderPaymentInfo.id) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Options not found');
    }

    if (!isSellerOrganization) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'You have already add payment info for change it contact with bop support',
      );
    }

    const findOrderPaymentInfo = await prisma.orderPaymentInfo.findFirst({
      where: {
        orderId: payload.orderId,
      },
      include: {
        order: true,
      },
    });
    if (!findOrderPaymentInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Options not found');
    }
    if (!orgId || orgId !== findOrderPaymentInfo.order.product_seller_id) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid organization info');
    }
    const result = await prisma.orderPaymentInfo.update({
      where: { id: findOrderPaymentInfo.id },
      data: { paymentSystemOptionsId: payload.paymentSystemOptionsId },
      include: {
        order: true,
        paymentSystemOptions: true,
      },
    });
    return result;
  }
  const result = await prisma.orderPaymentInfo.create({
    data: {
      orderId: payload.orderId,
      paymentSystemOptionsId: payload.paymentSystemOptionsId,
    },
    include: {
      order: true,
      paymentSystemOptions: true,
    },
  });

  return result;
};
const updateOrderDeliveryCharge = async (
  userId: string,
  userRole: string,
  orderId: string,
  deliveryCharge: number,
) => {
  const isvalidOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!isvalidOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order info not found');
  }

  const orgId = isvalidOrder.product_seller_id;

  // staff and owner validation
  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
    });

    if (!isValidStaff || !isValidStaff.isValidNow) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff info not fount');
    }
    const validStaffRole = ['STAFF_ADMIN', 'ORDER_SUPERVISOR'];

    if (!validStaffRole.includes(isValidStaff.role)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff role not valid');
    }

    if (orgId !== isValidStaff.organizationId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Your organization id not match',
      );
    }
  } else {
    const isValidUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!isValidUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Your info not found');
    }
    if (orgId !== isValidUser.organizationId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Your organization id not match',
      );
    }
  }
  if (!orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }
  const result = await prisma.order.update({
    where: { id: isvalidOrder.id },
    data: {
      deliveryCharge: deliveryCharge,
      totalWithDeliveryCharge: { increment: deliveryCharge },
    },
  });
  return result;
};
export const OrderService = {
  orderCreate,
  updateOrderStatus,
  updatePaymentStatus,
  getSingle,
  searchFilterIncomingOrders,
  searchFilterOutgoingOrders,
  getOrganizationOutgoingOrders,
  getOrganizationIncomingOrders,
  verifyDeliveryOtp,
  assignForDelivery,
  getMyOrderForDelivery,
  updateOrderPaymentOptions,
  updateOrderDeliveryCharge,
};
