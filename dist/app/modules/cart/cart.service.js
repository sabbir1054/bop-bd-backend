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
const updateCartSingle = (userId, productId, action) => __awaiter(void 0, void 0, void 0, function* () {
    const isProductExist = yield prisma_1.default.product.findUnique({
        where: { id: productId },
    });
    if (!isProductExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Product not found');
    }
    if (userId === isProductExist.ownerId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You can not add your product in the cart');
    }
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        let cart = yield prisma.cart.findFirst({
            where: { userId: userId },
            include: { CartItem: true },
        });
        if (!cart) {
            if (action === 'decrement') {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Cart not found for decrement action');
            }
            else {
                cart = yield prisma.cart.create({
                    data: { userId: userId },
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
const updateCartMultiple = (userId, productId, action, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    if (quantity <= 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Quantity must be greater than 0');
    }
    const isProductExist = yield prisma_1.default.product.findUnique({
        where: { id: productId },
    });
    if (!isProductExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Product not found');
    }
    if (userId === isProductExist.ownerId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You can not add your product in the cart');
    }
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        let cart = yield prisma.cart.findFirst({
            where: { userId: userId },
            include: { CartItem: true },
        });
        if (!cart) {
            if (action === 'decrement') {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Cart not found for decrement action');
            }
            else {
                cart = yield prisma.cart.create({
                    data: { userId: userId },
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
const removeItemsFromCart = (userId, cartItemIds) => __awaiter(void 0, void 0, void 0, function* () {
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
    if ((cartItems[0] && cartItems[0].cart.userId) !== userId) {
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
exports.CartServices = {
    updateCartSingle,
    updateCartMultiple,
    removeItemsFromCart,
};
