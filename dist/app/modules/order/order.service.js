"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const orderIdcodeGenerator_1 = require("../../../helpers/orderIdcodeGenerator");
const otpHelpers_1 = require("../../../helpers/otpHelpers");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const order_constant_1 = require("./order.constant");
const orderCreate = (userId, userRole, orderData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { shipping_address } = orderData;
    let cartId = null;
    if (userRole === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
            include: {
                organization: { include: { cart: true } },
            },
        });
        if (!isValidStaff) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Staff is invalid');
        }
        if (isValidStaff.role === 'PURCHASE_OFFICER' ||
            isValidStaff.role === 'STAFF_ADMIN') {
            cartId = isValidStaff.organization.cart[0].id;
        }
        else {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only store purchase officer or admin make order');
        }
    }
    else {
        const isValidUser = yield prisma_1.default.user.findUnique({
            where: { id: userId },
            include: { organization: { include: { cart: true } } },
        });
        if (!isValidUser) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Not valid user');
        }
        if (!((_a = isValidUser === null || isValidUser === void 0 ? void 0 : isValidUser.organization) === null || _a === void 0 ? void 0 : _a.cart[0].id)) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Cart info not found');
        }
        cartId = (_b = isValidUser === null || isValidUser === void 0 ? void 0 : isValidUser.organization) === null || _b === void 0 ? void 0 : _b.cart[0].id;
    }
    if (!cartId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Cart information not found');
    }
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        var _c, _d;
        // Fetch cart details including items
        const cart = yield prisma.cart.findUnique({
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
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, `Cart with id ${cartId} not found.`);
        }
        // Filter out items where the product owner is the same as the cart user
        const validCartItems = cart.CartItem.filter(item => item.product.organizationId !== cart.organizationId);
        if (validCartItems.length === 0) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `You cannot buy your own products.`);
        }
        // Create a map of product prices
        const productIds = validCartItems.map(item => item.productId);
        const products = yield prisma.product.findMany({
            where: {
                id: { in: productIds },
            },
            select: {
                id: true,
                price: true,
                discount_price: true,
            },
        });
        const productPriceMap = products.reduce((acc, product) => {
            var _a;
            acc[product.id] = (_a = product.discount_price) !== null && _a !== void 0 ? _a : product.price;
            return acc;
        }, {});
        // Group valid cart items by product owner
        const groupedByOwner = validCartItems.reduce((acc, item) => {
            const orgId = item.product.organizationId;
            if (!acc[orgId]) {
                acc[orgId] = [];
            }
            acc[orgId].push(item);
            return acc;
        }, {});
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
            if (!(cart === null || cart === void 0 ? void 0 : cart.Organization) || !(cart === null || cart === void 0 ? void 0 : cart.organizationId)) {
                throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
            }
            do {
                orderCode = (0, orderIdcodeGenerator_1.orderCodeGenerator)((_d = (_c = cart === null || cart === void 0 ? void 0 : cart.Organization) === null || _c === void 0 ? void 0 : _c.owner) === null || _d === void 0 ? void 0 : _d.phone, items[0].product.organization.owner.phone);
                const existingOrder = yield prisma.order.findUnique({
                    where: { orderCode },
                });
                if (!existingOrder) {
                    isUnique = true;
                }
            } while (!isUnique);
            // Create the order
            const order = yield prisma.order.create({
                data: {
                    orderCode, // Add the generated order code here
                    shipping_address: shipping_address,
                    total,
                    customer: {
                        connect: { id: cart === null || cart === void 0 ? void 0 : cart.organizationId },
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
        yield prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
            },
        });
        return createdOrders;
    }));
    return result;
});
//! here change it was owner id now it is organization id
const getOrganizationIncomingOrders = (organizationId, options) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistrganization = yield prisma_1.default.organization.findUnique({
        where: { id: organizationId },
    });
    if (!organizationId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
    }
    const { limit, page, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const result = yield prisma_1.default.order.findMany({
        where: { product_seller_id: organizationId },
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : {
                createdAt: 'desc',
            },
        include: {
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
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User incoming order not found');
    }
    const total = yield prisma_1.default.order.count({
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
});
//! here change it was owner id now it is organization id
const getOrganizationOutgoingOrders = (organizationId, options) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistrganization = yield prisma_1.default.organization.findUnique({
        where: { id: organizationId },
    });
    if (!organizationId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
    }
    const { limit, page, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const result = yield prisma_1.default.order.findMany({
        where: { customerId: organizationId },
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : {
                createdAt: 'desc',
            },
        include: {
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
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User incoming order not found');
    }
    const total = yield prisma_1.default.order.count({
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
});
// const getOrganizationIncomingOrders = async (
//   organizationId: string,
//   options: IPaginationOptions,
// ): Promise<IGenericResponse<Order[]>> => {
//   const isValidOrganization = await prisma.organization.findUnique({
//     where: { id: organizationId },
//   });
//   if (!isValidOrganization) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Organizaion info not found');
//   }
//   const ownerId = isValidOrganization.ownerId;
//   const { limit, page, skip } = paginationHelpers.calculatePagination(options);
//   const result = await prisma.order.findMany({
//     where: { product_seller_id: ownerId },
//     skip,
//     take: limit,
//     orderBy:
//       options.sortBy && options.sortOrder
//         ? { [options.sortBy]: options.sortOrder }
//         : {
//             createdAt: 'desc',
//           },
//     include: {
//       assigndForDelivery: true,
//       customer: {
//         select: {
//           id: true,
//           role: true,
//           email: true,
//           license: true,
//           nid: true,
//           memberCategory: true,
//           verified: true,
//           organization: true,
//           isMobileVerified: true,
//           name: true,
//           phone: true,
//           address: true,
//           photo: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//       },
//       orderItems: {
//         include: {
//           product: {
//             include: {
//               images: true,
//             },
//           },
//         },
//       },
//     },
//   });
//   if (!result) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User incoming order not found');
//   }
//   const total = await prisma.order.count({
//     where: { product_seller_id: ownerId },
//   });
//   return {
//     meta: {
//       total,
//       page,
//       limit,
//     },
//     data: result,
//   };
// };
// const getOrganizationOutgoingOrders = async (
//   organizationId: string,
//   options: IPaginationOptions,
// ): Promise<IGenericResponse<Order[]>> => {
//   const isValidOrganization = await prisma.organization.findUnique({
//     where: { id: organizationId },
//   });
//   if (!isValidOrganization) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Organizaion info not found');
//   }
//   const userId = isValidOrganization.ownerId;
//   const { limit, page, skip } = paginationHelpers.calculatePagination(options);
//   const result = await prisma.order.findMany({
//     where: { customerId: userId },
//     skip,
//     take: limit,
//     orderBy:
//       options.sortBy && options.sortOrder
//         ? { [options.sortBy]: options.sortOrder }
//         : {
//             createdAt: 'desc',
//           },
//     include: {
//       assigndForDelivery: true,
//       product_seller: {
//         select: {
//           id: true,
//           role: true,
//           email: true,
//           license: true,
//           nid: true,
//           memberCategory: true,
//           verified: true,
//           organization: true,
//           isMobileVerified: true,
//           name: true,
//           phone: true,
//           address: true,
//           photo: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//       },
//       orderItems: {
//         include: {
//           product: true,
//         },
//       },
//     },
//   });
//   if (!result) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User incoming order not found');
//   }
//   const total = await prisma.order.count({
//     where: { customerId: userId },
//   });
//   return {
//     meta: {
//       total,
//       page,
//       limit,
//     },
//     data: result,
//   };
// };
const updateOrderStatus = (userId, userRole, orderId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistOrder = yield prisma_1.default.order.findUnique({
        where: { id: orderId },
        include: {
            customer: { include: { owner: true } },
        },
    });
    if (!isExistOrder) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Order not exist ');
    }
    const customerPhone = isExistOrder.customer.owner.phone;
    let orgId = null;
    //* here ensure only owner,staff admin,order supervisor, delivery boy update status
    if (userRole === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
            include: { organization: true },
        });
        if (!isValidStaff) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Staff is invalid');
        }
        if (!order_constant_1.validStaffRoleForOrderStatusUpdate.includes(isValidStaff.role)) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You are not able to change order status');
        }
        orgId = isValidStaff.organization.id;
    }
    else {
        const userInfo = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!userInfo) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'user Info not found');
        }
        orgId = userInfo.organizationId;
    }
    if (orgId !== isExistOrder.product_seller_id) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only order supervisor and staff admin can change the status');
    }
    //* here ensure that Ddelivered status update by only staff admin and delivery boy
    if (status === 'DELIVERED') {
        // confirm staff role
        let staffRole = null;
        if (userRole === 'STAFF') {
            const isValidStaff = yield prisma_1.default.staff.findUnique({
                where: { staffInfoId: userId },
                include: { organization: true },
            });
            if (!isValidStaff) {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only delivery boy change status to delivered');
            }
            staffRole = isValidStaff === null || isValidStaff === void 0 ? void 0 : isValidStaff.role;
            const validRole = ['DELIVERY_BOY', 'STAFF_ADMIN'];
            if (!validRole.includes(staffRole)) {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only delivery boy change status to delivered');
            }
        }
        if (staffRole === 'DELIVERY_BOY') {
            //* order delivery update with verification by delivery boy
            const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
                const otp = (0, otpHelpers_1.generateOTP)();
                const sendOtp = yield (0, otpHelpers_1.sendOTP)(customerPhone, otp, `From BOP-BD, Your order delivery verification code is ${otp}`);
                if (sendOtp == null || sendOtp.Status != 0) {
                    throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Otp not send please try again');
                }
                const makeOtpForUser = yield prisma.orderOtp.create({
                    data: {
                        phone: customerPhone,
                        orderId: orderId,
                        otpCode: otp,
                        countSend: 1,
                    },
                });
                if (!makeOtpForUser) {
                    throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Otp not set');
                }
                const result = { message: 'Otp send successfully' };
                return result;
            }));
            return result;
        }
        else {
            //* order delivery update without verification by staff admin
            const result = yield prisma_1.default.order.update({
                where: { id: orderId },
                data: { orderStatus: status },
            });
            return result;
        }
    }
    else {
        //* here ensure orders others status update by owner admin and order supervisor
        if (userRole === 'STAFF') {
            const isValidStaff = yield prisma_1.default.staff.findUnique({
                where: { staffInfoId: userId },
                include: { organization: true },
            });
            if ((isValidStaff === null || isValidStaff === void 0 ? void 0 : isValidStaff.role) === 'DELIVERY_BOY') {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Delivery boy not change other order status');
            }
        }
        const result = yield prisma_1.default.order.update({
            where: { id: orderId },
            data: { orderStatus: status },
            include: {
                assigndForDelivery: true,
            },
        });
        return result;
    }
});
const verifyDeliveryOtp = (userId, userRole, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isValidStaff = yield prisma_1.default.staff.findUnique({
        where: { staffInfoId: userId },
        include: { organization: true },
    });
    if (!isValidStaff) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Staff is invalid');
    }
    if (isValidStaff.role !== 'DELIVERY_BOY') {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You can not submit delivery verification code.');
    }
    const isExistOrder = yield prisma_1.default.order.findUnique({
        where: { id: payload.orderId },
        include: {
            customer: { include: { owner: true } },
        },
    });
    if (!isExistOrder) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Order not exist ');
    }
    const customerPhone = isExistOrder.customer.owner.phone;
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        const findOtp = yield prisma.orderOtp.findUnique({
            where: { orderId: isExistOrder.id, phone: customerPhone },
        });
        if (!findOtp) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Otp info not found');
        }
        if (findOtp.isVerified === true) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Delivery otp already verified');
        }
        if (payload.givenOtp !== findOtp.otpCode) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Delivery otp not match');
        }
        else {
            yield prisma.orderOtp.update({
                where: { orderId: isExistOrder.id, phone: customerPhone },
                data: {
                    isVerified: true,
                },
            });
            if (isExistOrder.paymentStatus === 'PAID') {
                const result = yield prisma.order.update({
                    where: { id: payload.orderId },
                    data: { orderStatus: 'DELIVERED' },
                });
                return result;
            }
            else {
                const result = yield prisma.order.update({
                    where: { id: payload.orderId },
                    data: { orderStatus: 'DELIVERED', paymentStatus: 'PAID' },
                });
                return result;
            }
        }
    }));
    return result;
});
const updatePaymentStatus = (userId, userRole, orderId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistOrder = yield prisma_1.default.order.findUnique({
        where: { id: orderId },
    });
    if (!isExistOrder) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Order not exist ');
    }
    let orgId = null;
    //* here ensure only owner,staff admin,order supervisor, delivery boy update status
    if (userRole === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
            include: { organization: true },
        });
        if (!isValidStaff) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Staff is invalid');
        }
        if (!order_constant_1.validStaffRoleForOrderStatusUpdate.includes(isValidStaff.role)) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You are not able to change order status');
        }
        orgId = isValidStaff.organization.id;
    }
    else {
        const userInfo = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!userInfo) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'user Info not found');
        }
        orgId = userInfo.organizationId;
    }
    const result = yield prisma_1.default.order.update({
        where: { id: orderId },
        data: { paymentStatus: status },
    });
    return result;
});
const getSingle = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.order.findUnique({
        where: { id },
        include: {
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
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Order doesnt exist');
    }
    return result;
});
const searchFilterIncomingOrders = (userId, userRole, filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const { searchTerm, phone } = filters, filtersData = __rest(filters, ["searchTerm", "phone"]);
    const andConditions = [];
    let orgId = null;
    if (userRole === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
            include: { organization: true },
        });
        if (!isValidStaff) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Staff is invalid');
        }
        const validUser = ['ORDER_SUPERVISOR', 'STAFF_ADMIN'];
        if (validUser.includes(isValidStaff.role)) {
            orgId = isValidStaff.organization.id;
        }
        else {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You are not allowed to see outgoing orders');
        }
    }
    else {
        const userInfo = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!userInfo) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'user Info not found');
        }
        orgId = userInfo.organizationId;
    }
    if (searchTerm) {
        andConditions.push({
            OR: order_constant_1.ordersSearchableFields.map(field => ({
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
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.order.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : {
                createdAt: 'desc',
            },
        include: {
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
    const total = yield prisma_1.default.order.count({
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
});
const searchFilterOutgoingOrders = (userId, userRole, filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const { searchTerm, phone } = filters, filtersData = __rest(filters, ["searchTerm", "phone"]);
    const andConditions = [];
    let orgId = null;
    if (userRole === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
            include: { organization: true },
        });
        if (!isValidStaff) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Staff is invalid');
        }
        const validUser = ['PURCHASE_OFFICER', 'ORDER_SUPERVISOR', 'STAFF_ADMIN'];
        if (validUser.includes(isValidStaff.role)) {
            orgId = isValidStaff.organization.id;
        }
        else {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You are not allowed to see outgoing orders');
        }
    }
    else {
        const userInfo = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!userInfo) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'user Info not found');
        }
        orgId = userInfo.organizationId;
    }
    if (searchTerm) {
        andConditions.push({
            OR: order_constant_1.ordersSearchableFields.map(field => ({
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
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.order.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : {
                createdAt: 'desc',
            },
        include: {
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
    const total = yield prisma_1.default.order.count({
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
});
const assignForDelivery = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const IsValidUserRole = yield prisma_1.default.user.findUnique({
        where: { id: userId },
        include: { Staff: { include: { organization: true } } },
    });
    if (!(IsValidUserRole === null || IsValidUserRole === void 0 ? void 0 : IsValidUserRole.Staff)) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User info not found');
    }
    const validStaffRole = ['ORDER_SUPERVISOR', 'STAFF_ADMIN'];
    if (!validStaffRole.includes(IsValidUserRole.Staff.role)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only order supervisor and staff admin can assign delivery boy');
    }
    const isDeliveryBoyExist = yield prisma_1.default.staff.findUnique({
        where: { id: payload.deliveryBoyId },
    });
    if (!isDeliveryBoyExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Delivery boy info not found');
    }
    if (isDeliveryBoyExist.role !== 'DELIVERY_BOY') {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Please provide valid delivery boy id');
    }
    if (!isDeliveryBoyExist.deliveryArea) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Delivery have not any specific area for percel delivery');
    }
    const isOrderExist = yield prisma_1.default.order.findUnique({
        where: { id: payload.orderId },
    });
    if (!isOrderExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Order info not found');
    }
    if (isOrderExist.product_seller_id !== IsValidUserRole.Staff.organization.id) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Order id not valid ');
    }
    const result = yield prisma_1.default.assigndForDelivery.create({
        data: {
            assignedby: { connect: { id: IsValidUserRole.Staff.id } },
            deliveryBoy: { connect: { id: payload.deliveryBoyId } },
            order: { connect: { id: payload.orderId } },
        },
    });
    return result;
});
const getMyOrderForDelivery = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const isValidStaff = yield prisma_1.default.staff.findUnique({
        where: { staffInfoId: userId },
    });
    if (!isValidStaff) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Staff info not found');
    }
    if (isValidStaff.role !== 'DELIVERY_BOY') {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Delivery boy only access it');
    }
    const result = yield prisma_1.default.assigndForDelivery.findMany({
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
});
exports.OrderService = {
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
};
