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
exports.FeedbackService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const createNew = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, productId, rating, comment } = payload;
    if (rating > 5) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Rating not more than 5');
    }
    if (id !== userId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User id not match');
    }
    const isProductExist = yield prisma_1.default.product.findUnique({
        where: { id: productId },
    });
    if (!isProductExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Product does not exist');
    }
    const orders = yield prisma_1.default.order.findMany({
        where: {
            customerId: userId,
            orderItems: {
                some: {
                    productId: productId,
                },
            },
        },
        include: {
            orderItems: true,
        },
    });
    //* Calculate the total quantity of the product the user has purchased
    const totalPurchased = orders.reduce((sum, order) => {
        return (sum +
            order.orderItems
                .filter(item => item.productId === productId)
                .reduce((subSum, item) => subSum + item.quantity, 0));
    }, 0);
    if (totalPurchased === 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User has not purchased this product.');
    }
    //* Count the number of feedbacks the user has already given for the product
    const feedbackCount = yield prisma_1.default.feedback.count({
        where: {
            userId: userId,
            productId: productId,
        },
    });
    if (feedbackCount >= totalPurchased) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User has already given the maximum number of feedbacks for this product.');
    }
    // Create feedback
    const result = yield prisma_1.default.feedback.create({
        data: {
            rating,
            comment,
            user: { connect: { id: userId } },
            product: { connect: { id: productId } },
        },
    });
    return result;
});
const getAll = (role, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        const result = yield prisma_1.default.feedback.findMany({
            include: { user: true, product: true },
        });
        return result;
    }
    else {
        const result = yield prisma_1.default.feedback.findMany({
            where: { userId: userId },
            include: { user: true, product: true },
        });
        return result;
    }
});
const getSingle = (feedbackId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.feedback.findUnique({
        where: { id: feedbackId },
        include: {
            user: {
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
            product: {
                include: {
                    owner: {
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
                    images: true,
                    category: true,
                    feedbacks: true,
                },
            },
        },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Feedback not found');
    }
    return result;
});
const updateSingle = (userId, feedbackId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.rating && payload.rating > 5) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Rating is not more than 5');
    }
    const isFeedbackExist = yield prisma_1.default.feedback.findUnique({
        where: { id: feedbackId },
    });
    if (!isFeedbackExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Feedback not found');
    }
    if (userId !== isFeedbackExist.userId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You can not change others feedback');
    }
    const result = yield prisma_1.default.feedback.update({
        where: { id: feedbackId },
        data: Object.assign({}, payload),
    });
    return result;
});
const deleteSingle = (userId, feedbackId) => __awaiter(void 0, void 0, void 0, function* () {
    const isFeedbackExist = yield prisma_1.default.feedback.findUnique({
        where: { id: feedbackId },
    });
    if (!isFeedbackExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Feedback not found');
    }
    if (userId !== isFeedbackExist.userId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You can not delete others feedback');
    }
    const result = yield prisma_1.default.feedback.delete({
        where: { id: feedbackId },
    });
    return result;
});
exports.FeedbackService = {
    createNew,
    getAll,
    getSingle,
    updateSingle,
    deleteSingle,
};
