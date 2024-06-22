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
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const order_constant_1 = require("./order.constant");
// const orderCreate = async (orderData: IOrderCreate): Promise<Order[]> => {
//   const { cartId, shipping_address } = orderData;
//   const result = await prisma.$transaction(async prisma => {
//     // Fetch cart details including items
//     const cart = await prisma.cart.findUnique({
//       where: { id: cartId },
//       include: {
//         CartItem: {
//           include: {
//             product: {
//               include: {
//                 owner: true,
//               },
//             },
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
//     // Filter out items where the product owner is the same as the cart user
//     const validCartItems = cart.CartItem.filter(
//       item => item.product.ownerId !== cart.userId,
//     );
//     if (validCartItems.length === 0) {
//       throw new ApiError(
//         httpStatus.BAD_REQUEST,
//         `You cannot buy your own products.`,
//       );
//     }
//     // Create a map of product prices
//     const productIds = validCartItems.map(item => item.productId);
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
//     // Group valid cart items by product owner
//     const groupedByOwner = validCartItems.reduce(
//       (acc, item) => {
//         const ownerId = item.product.ownerId;
//         if (!acc[ownerId]) {
//           acc[ownerId] = [];
//         }
//         acc[ownerId].push(item);
//         return acc;
//       },
//       {} as { [key: string]: typeof validCartItems },
//     );
//     const createdOrders = [];
//     // Create separate orders for each product owner
//     for (const [ownerId, items] of Object.entries(groupedByOwner)) {
//       const orderItemsData = items.map(item => ({
//         productId: item.productId,
//         quantity: item.quantity,
//         price: productPriceMap[item.productId],
//       }));
//       const total = orderItemsData.reduce((acc, item) => {
//         const price = productPriceMap[item.productId];
//         return acc + price * item.quantity;
//       }, 0);
//       // Create the order
//       const order = await prisma.order.create({
//         data: {
//           shipping_address: shipping_address,
//           total,
//           customer: {
//             connect: { id: cart.userId },
//           },
//           product_seller: {
//             connect: { id: ownerId },
//           },
//           orderItems: {
//             create: orderItemsData.map(item => ({
//               product: {
//                 connect: { id: item.productId },
//               },
//               quantity: item.quantity,
//               price: item.price,
//             })),
//           },
//         },
//         include: {
//           orderItems: true,
//         },
//       });
//       createdOrders.push(order);
//     }
//     // Empty the cart
//     await prisma.cartItem.deleteMany({
//       where: {
//         cartId: cart.id,
//       },
//     });
//     return createdOrders;
//   });
//   return result;
// };
const orderCreate = (orderData) => __awaiter(void 0, void 0, void 0, function* () {
    const { cartId, shipping_address } = orderData;
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // Fetch cart details including items
        const cart = yield prisma.cart.findUnique({
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
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, `Cart with id ${cartId} not found.`);
        }
        // Filter out items where the product owner is the same as the cart user
        const validCartItems = cart.CartItem.filter(item => item.product.ownerId !== cart.userId);
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
            const ownerId = item.product.ownerId;
            if (!acc[ownerId]) {
                acc[ownerId] = [];
            }
            acc[ownerId].push(item);
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
            do {
                orderCode = (0, orderIdcodeGenerator_1.orderCodeGenerator)(cart.user.phone, items[0].product.owner.phone);
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
        yield prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
            },
        });
        return createdOrders;
    }));
    return result;
});
const getUserIncomingOrders = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.order.findMany({
        where: { product_seller_id: userId },
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
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User incoming order not found');
    }
    return result;
});
const getUserOutgoingOrders = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.order.findMany({
        where: { customerId: userId },
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
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User incoming order not found');
    }
    return result;
});
const updateOrderStatus = (userId, orderId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistOrder = yield prisma_1.default.order.findUnique({
        where: { id: orderId },
    });
    if (!isExistOrder) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Order not exist ');
    }
    if (userId !== isExistOrder.product_seller_id) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only product seller can change the status');
    }
    const result = yield prisma_1.default.order.update({
        where: { id: orderId },
        data: { orderStatus: status },
    });
    return result;
});
const updatePaymentStatus = (userId, orderId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistOrder = yield prisma_1.default.order.findUnique({
        where: { id: orderId },
    });
    if (!isExistOrder) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Order not exist ');
    }
    if (userId !== isExistOrder.product_seller_id) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only product seller can change the status');
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
            customer: true,
            product_seller: true,
            orderItems: {
                include: {
                    product: true,
                },
            },
        },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Order doesnt exist');
    }
    return result;
});
const searchFilterIncomingOrders = (ownerId, filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const { searchTerm, phone } = filters, filtersData = __rest(filters, ["searchTerm", "phone"]);
    const andConditions = [];
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
        product_seller_id: ownerId,
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
const searchFilterOutgoingOrders = (ownerId, filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const { searchTerm, phone } = filters, filtersData = __rest(filters, ["searchTerm", "phone"]);
    const andConditions = [];
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
        customerId: ownerId,
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
exports.OrderService = {
    orderCreate,
    getUserIncomingOrders,
    getUserOutgoingOrders,
    updateOrderStatus,
    updatePaymentStatus,
    getSingle,
    searchFilterIncomingOrders,
    searchFilterOutgoingOrders,
};
