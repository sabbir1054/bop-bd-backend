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
const fs_1 = __importDefault(require("fs"));
const http_status_1 = __importDefault(require("http-status"));
const path_1 = __importDefault(require("path"));
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
const updateOrganization = (req, next) => __awaiter(void 0, void 0, void 0, function* () {
    const deletePhoto = (photoLink) => {
        // Delete the image file from the server
        const filePath = path_1.default.join(process.cwd(), 'uploads/organizationPhoto', path_1.default.basename(photoLink));
        fs_1.default.unlink(filePath, err => {
            if (err) {
                deletePhoto(req.body.photo);
                next(new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Failed to delete previous image, try again for update,photo `));
            }
        });
    };
    const { photo, name } = req.body;
    const { id: userId, role: userRole } = req.user;
    let orgId = null;
    if (userRole === 'STAFF') {
        const userInfo = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
        });
        if (!userInfo) {
            if (photo) {
                deletePhoto(photo);
            }
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User info not found');
        }
        const validStaff = ['STAFF_ADMIN'];
        if (!validStaff.includes(userInfo.role)) {
            if (photo) {
                deletePhoto(photo);
            }
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only admin staff and owner can delete Payment options');
        }
        orgId = userInfo.organizationId;
    }
    else {
        const userInfo = yield prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!userInfo) {
            if (photo) {
                deletePhoto(photo);
            }
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User info not found');
        }
        orgId = userInfo.organizationId;
    }
    if (!orgId) {
        if (photo) {
            deletePhoto(photo);
        }
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Organization info not found');
    }
    const isOrganizationExist = yield prisma_1.default.organization.findUnique({
        where: { id: orgId },
    });
    if (!isOrganizationExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
    }
    if (isOrganizationExist.photo && photo) {
        deletePhoto(isOrganizationExist.photo);
    }
    if (photo && name) {
        const result = yield prisma_1.default.organization.update({
            where: { id: orgId },
            data: {
                photo: photo,
                name: name,
            },
        });
        return result;
    }
    else {
        if (photo) {
            const result = yield prisma_1.default.organization.update({
                where: { id: orgId },
                data: {
                    photo: photo,
                },
            });
            return result;
        }
        if (name) {
            const result = yield prisma_1.default.organization.update({
                where: { id: orgId },
                data: {
                    name: name,
                },
            });
            return result;
        }
    }
});
const removePicture = (userId, userRole, next) => __awaiter(void 0, void 0, void 0, function* () {
    const deletePhoto = (photoLink) => {
        // Delete the image file from the server
        const filePath = path_1.default.join(process.cwd(), 'uploads/organizationPhoto', path_1.default.basename(photoLink));
        fs_1.default.unlink(filePath, err => {
            if (err) {
                next(new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Failed to delete previous image, try again for update,photo `));
            }
        });
    };
    let orgId = null;
    if (userRole === 'STAFF') {
        const userInfo = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
        });
        if (!userInfo) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User info not found');
        }
        const validStaff = ['STAFF_ADMIN'];
        if (!validStaff.includes(userInfo.role)) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only admin staff and owner can delete Payment options');
        }
        orgId = userInfo.organizationId;
    }
    else {
        const userInfo = yield prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!userInfo) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User info not found');
        }
        orgId = userInfo.organizationId;
    }
    if (!orgId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Organization info not found');
    }
    const isOrganizationExist = yield prisma_1.default.organization.findUnique({
        where: { id: orgId },
    });
    if (!isOrganizationExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
    }
    if (isOrganizationExist.photo) {
        deletePhoto(isOrganizationExist.photo);
    }
    const result = yield prisma_1.default.organization.update({
        where: { id: orgId },
        data: {
            photo: '',
        },
    });
    return result;
});
const updateOrganizationMembershipCategory = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.organization.findUnique({
        where: { id: payload.organizationId },
    });
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
    }
    const result = yield prisma_1.default.organization.update({
        where: { id: payload.organizationId },
        data: {
            memberShipCategory: payload.memberShipCategory,
        },
    });
    return result;
});
exports.OrganizaionServices = {
    getDashboardMatrics,
    getOutgoingOrdersByDate,
    getIncomingOrdersByDate,
    updateOrganization,
    removePicture,
    updateOrganizationMembershipCategory,
};
