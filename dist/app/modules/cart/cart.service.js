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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const updateCartSingle = (userId, userRole, productId, action) => __awaiter(void 0, void 0, void 0, function* () {
    const isProductExist = yield prisma_1.default.product.findUnique({
        where: { id: productId },
        include: { organization: true },
    });
    if (!isProductExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Product not found');
    }
    let orgId = null;
    if (userRole === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
            include: { organization: true },
        });
        if (!isValidStaff) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Staff is invalid');
        }
        const validPurchaseRole = ['PURCHASE_OFFICER', 'STAFF_ADMIN'];
        if (!validPurchaseRole.includes(isValidStaff.role)) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only puchase officer or admin change cart');
        }
        orgId = isValidStaff.organization.id;
    }
    else {
        const isUserExist = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!isUserExist) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
        }
        orgId = isUserExist.organizationId;
    }
    if (!orgId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
    }
    const organizationInfo = yield prisma_1.default.organization.findUnique({
        where: { id: orgId },
        include: { owner: true },
    });
    const isValidOwner = yield prisma_1.default.user.findUnique({
        where: { id: organizationInfo === null || organizationInfo === void 0 ? void 0 : organizationInfo.owner.id },
    });
    if (!(isValidOwner === null || isValidOwner === void 0 ? void 0 : isValidOwner.verified)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Organization is not verified');
    }
    if (orgId === isProductExist.organizationId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You can not add your product in the cart');
    }
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        let cart = yield prisma.cart.findFirst({
            where: { organizationId: orgId },
            include: { CartItem: true },
        });
        if (!cart) {
            if (action === 'decrement') {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Cart not found for decrement action');
            }
            else {
                cart = yield prisma.cart.create({
                    data: { organizationId: orgId },
                    include: { CartItem: true },
                });
            }
        }
        let cartItem = yield prisma.cartItem.findFirst({
            where: {
                cartId: cart === null || cart === void 0 ? void 0 : cart.id,
                productId: productId,
            },
        });
        if (cartItem) {
            if (action === 'increment') {
                cartItem = yield prisma.cartItem.update({
                    where: { id: cartItem.id },
                    data: { quantity: { increment: 1 } },
                });
            }
            else if (action === 'decrement') {
                if (cartItem.quantity > 1) {
                    cartItem = yield prisma.cartItem.update({
                        where: { id: cartItem.id },
                        data: { quantity: { decrement: 1 } },
                    });
                }
                else {
                    yield prisma.cartItem.delete({
                        where: { id: cartItem.id },
                    });
                }
            }
        }
        else {
            if (action === 'increment') {
                cartItem = yield prisma.cartItem.create({
                    data: {
                        cart: { connect: { id: cart === null || cart === void 0 ? void 0 : cart.id } },
                        product: { connect: { id: productId } },
                        quantity: 1,
                    },
                });
            }
            else {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Cart item not found for decrement action');
            }
        }
        return prisma.cart.findUnique({
            where: { id: cart === null || cart === void 0 ? void 0 : cart.id },
            include: { CartItem: true },
        });
    }));
    return result;
});
const updateCartMultiple = (userId, userRole, productId, action, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    if (quantity <= 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Quantity must be greater than 0');
    }
    const isProductExist = yield prisma_1.default.product.findUnique({
        where: { id: productId },
    });
    if (!isProductExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Product not found');
    }
    let orgId = null;
    if (userRole === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
            include: { organization: true },
        });
        if (!isValidStaff) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Staff is invalid');
        }
        if (isValidStaff.role !== ('PURCHASE_OFFICER' || 'STAFF_ADMIN')) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only store purchase officer or admin delete the product image');
        }
        orgId = isValidStaff.organization.id;
    }
    else {
        const isUserExist = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!isUserExist) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
        }
        orgId = isUserExist.organizationId;
    }
    if (!orgId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
    }
    const organizationInfo = yield prisma_1.default.organization.findUnique({
        where: { id: orgId },
        include: { owner: true },
    });
    const isValidOwner = yield prisma_1.default.user.findUnique({
        where: { id: organizationInfo === null || organizationInfo === void 0 ? void 0 : organizationInfo.owner.id },
    });
    if (!(isValidOwner === null || isValidOwner === void 0 ? void 0 : isValidOwner.verified)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Organization is not verified');
    }
    if (orgId === isProductExist.organizationId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You can not add your product in the cart');
    }
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        let cart = yield prisma.cart.findFirst({
            where: { organizationId: orgId },
            include: { CartItem: true },
        });
        if (!cart) {
            if (action === 'decrement') {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Cart not found for decrement action');
            }
            else {
                cart = yield prisma.cart.create({
                    data: { organizationId: orgId },
                    include: { CartItem: true },
                });
            }
        }
        let cartItem = yield prisma.cartItem.findFirst({
            where: {
                cartId: cart === null || cart === void 0 ? void 0 : cart.id,
                productId: productId,
            },
        });
        if (cartItem) {
            if (action === 'increment') {
                cartItem = yield prisma.cartItem.update({
                    where: { id: cartItem.id },
                    data: { quantity: { increment: quantity } },
                });
            }
            else if (action === 'decrement') {
                if (cartItem.quantity > quantity) {
                    cartItem = yield prisma.cartItem.update({
                        where: { id: cartItem.id },
                        data: { quantity: { decrement: quantity } },
                    });
                }
                else {
                    yield prisma.cartItem.delete({
                        where: { id: cartItem.id },
                    });
                }
            }
        }
        else {
            if (action === 'increment') {
                cartItem = yield prisma.cartItem.create({
                    data: {
                        cart: { connect: { id: cart === null || cart === void 0 ? void 0 : cart.id } },
                        product: { connect: { id: productId } },
                        quantity: quantity,
                    },
                });
            }
            else {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Cart item not found for decrement action');
            }
        }
        return prisma.cart.findUnique({
            where: { id: cart === null || cart === void 0 ? void 0 : cart.id },
            include: { CartItem: true },
        });
    }));
    return result;
});
const removeItemsFromCart = (userId, userRole, cartItemIds) => __awaiter(void 0, void 0, void 0, function* () {
    const cartItems = yield prisma_1.default.cartItem.findMany({
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
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
            include: { organization: true },
        });
        if (!isValidStaff) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Staff is invalid');
        }
        if (isValidStaff.role !== ('PURCHASE_OFFICER' || 'STAFF_ADMIN')) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only store manager or admin delete the product image');
        }
        orgId = isValidStaff.organization;
    }
    else {
        const isUserExist = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!isUserExist) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
        }
        orgId = isUserExist.organizationId;
    }
    if ((cartItems[0] && cartItems[0].cart.organizationId) !== orgId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "You can't change other cart");
    }
    if (cartItems.length === 0) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Cart items not found');
    }
    const deletedItems = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        const deletePromises = cartItems.map(cartItem => prisma.cartItem.delete({
            where: { id: cartItem.id },
        }));
        yield Promise.all(deletePromises);
        return cartItems;
    }));
    return deletedItems;
});
const getMyCart = (userId, userRole) => __awaiter(void 0, void 0, void 0, function* () {
    let orgId = null;
    if (userRole === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
            include: { organization: true },
        });
        if (!isValidStaff) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Staff is invalid');
        }
        if (isValidStaff.role !== ('PURCHASE_OFFICER' || 'STAFF_ADMIN')) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only store manager or admin delete the product image');
        }
        orgId = isValidStaff.organization.id;
    }
    else {
        const isUserExist = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!isUserExist) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
        }
        orgId = isUserExist.organizationId;
    }
    if (!orgId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
    }
    const organizationCart = yield prisma_1.default.organization.findUnique({
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
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const result = organizationCart.cart;
    return result;
});
const getSingleUserCart = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (!isUserExist.organizationId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User organization not found');
    }
    const isOrganizationExist = yield prisma_1.default.organization.findUnique({
        where: { id: isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.organizationId },
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
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization not found');
    }
    const result = isOrganizationExist.cart;
    return result;
});
exports.CartServices = {
    updateCartSingle,
    updateCartMultiple,
    removeItemsFromCart,
    getMyCart,
    getSingleUserCart,
};
