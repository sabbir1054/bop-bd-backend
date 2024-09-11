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
exports.OrganizaionServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const getDashboardMatrics = (userId, userRole) => __awaiter(void 0, void 0, void 0, function* () {
    let ownerId = null;
    if (userRole === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
            include: {
                organization: true,
            },
        });
        if (!isValidStaff) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Staff info not found');
        }
        if (isValidStaff.role !== 'STAFF_ADMIN') {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Staff role not valid');
        }
        ownerId = isValidStaff.organization.ownerId;
    }
    else {
        ownerId = userId;
    }
    if (!ownerId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Owner info not found');
    }
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // Total outgoing orders
        const totalOutgoingOrders = yield prisma.order.count({
            where: { product_seller_id: userId },
        });
        // Total incoming orders
        const totalIncomingOrders = yield prisma.order.count({
            where: { customerId: userId },
        });
        // Outgoing orders status count
        const outgoingOrdersStatus = yield prisma.order.groupBy({
            by: ['orderStatus'],
            where: { product_seller_id: userId },
            _count: { orderStatus: true },
        });
        // Outgoing payment status count
        const outgoingPaymentStatus = yield prisma.order.groupBy({
            by: ['paymentStatus'],
            where: { product_seller_id: userId },
            _count: { orderStatus: true },
        });
        // Incoming orders status count
        const incomingOrdersStatus = yield prisma.order.groupBy({
            by: ['orderStatus'],
            where: { customerId: userId },
            _count: { orderStatus: true },
        });
        // Incoming orders payment status count
        const incomingPaymentStatus = yield prisma.order.groupBy({
            by: ['paymentStatus'],
            where: { customerId: userId },
            _count: { orderStatus: true },
        });
        // Total cost from outgoing orders
        const totalCostOutgoingOrders = yield prisma.order.aggregate({
            where: { product_seller_id: userId },
            _sum: { total: true },
        });
        // Total earned from incoming orders
        const totalEarnedIncomingOrders = yield prisma.order.aggregate({
            where: { customerId: userId },
            _sum: { total: true },
        });
        return {
            totalOutgoingOrders,
            totalIncomingOrders,
            outgoingOrdersStatus,
            incomingOrdersStatus,
            outgoingPaymentStatus,
            incomingPaymentStatus,
            totalCostOutgoingOrders: totalCostOutgoingOrders._sum.total,
            totalEarnedIncomingOrders: totalEarnedIncomingOrders._sum.total,
        };
    }));
    return result;
});
const getOutgoingOrdersByDate = (userId, userRole, date) => __awaiter(void 0, void 0, void 0, function* () {
    // formate date
    const start = new Date(date.startDate);
    const end = new Date(date.endDate);
    let ownerId = null;
    if (userRole === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
            include: {
                organization: true,
            },
        });
        if (!isValidStaff) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Staff info not found');
        }
        const validStaffRole = ['STAFF_ADMIN', 'ACCOUNTS_MANAGER'];
        if (!validStaffRole.includes(isValidStaff.role)) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Staff role not valid');
        }
        ownerId = isValidStaff.organization.ownerId;
    }
    else {
        ownerId = userId;
    }
    if (!ownerId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Owner info not found');
    }
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // Total outgoing orders within date range
        const outgoingOrders = yield prisma.order.findMany({
            where: {
                customerId: ownerId,
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
        });
        // Total cost from outgoing orders within date range
        const totalCostOutgoingOrders = yield prisma.order.aggregate({
            where: {
                customerId: ownerId,
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
            _sum: { total: true },
        });
        return {
            outgoingOrders: outgoingOrders,
            outgoingOrderCost: totalCostOutgoingOrders,
            date: date,
        };
    }));
});
const getIncomingOrdersByDate = (userId, userRole, date) => __awaiter(void 0, void 0, void 0, function* () {
    // formate date
    const start = new Date(date.startDate);
    const end = new Date(date.endDate);
    let ownerId = null;
    if (userRole === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
            include: {
                organization: true,
            },
        });
        if (!isValidStaff) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Staff info not found');
        }
        const validStaffRole = ['STAFF_ADMIN', 'ACCOUNTS_MANAGER'];
        if (!validStaffRole.includes(isValidStaff.role)) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Staff role not valid');
        }
        ownerId = isValidStaff.organization.ownerId;
    }
    else {
        ownerId = userId;
    }
    if (!ownerId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Owner info not found');
    }
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // Total outgoing orders within date range
        const incomingOrders = yield prisma.order.findMany({
            where: {
                product_seller_id: ownerId,
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
        });
        // Total cost from outgoing orders within date range
        const totalEarnIncomingOrders = yield prisma.order.aggregate({
            where: {
                product_seller_id: ownerId,
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
            _sum: { total: true },
        });
        return {
            incomingOrders: incomingOrders,
            incomingOrderEarning: totalEarnIncomingOrders,
            date: date,
        };
    }));
});
exports.OrganizaionServices = {
    getDashboardMatrics,
    getOutgoingOrdersByDate,
    getIncomingOrdersByDate,
};
