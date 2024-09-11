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
exports.PaymentSystemOptionsService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const createNew = (userid, userRole, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (userRole === 'STAFF') {
        const userInfo = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userid },
        });
        if (!userInfo) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User info not found');
        }
        const validStaff = ['STAFF_ADMIN', 'ACCOUNTS_MANAGER'];
        if (!validStaff.includes(userInfo.role)) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only accounts manager and admin staff and owner can cerate Payment options');
        }
    }
    const organizationInfo = yield prisma_1.default.organization.findUnique({
        where: { ownerId: userid },
        include: {
            owner: true,
        },
    });
    if (!((_a = organizationInfo === null || organizationInfo === void 0 ? void 0 : organizationInfo.owner) === null || _a === void 0 ? void 0 : _a.verified)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Your organization is not verified');
    }
    const result = yield prisma_1.default.paymentSystemOptions.create({ data: payload });
    return result;
});
const getAll = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const organizationInfo = yield prisma_1.default.user.findUnique({
        where: { id: userId },
        include: { organization: { include: { BusinessType: true } } },
    });
    if (!organizationInfo) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
    }
    const result = yield prisma_1.default.paymentSystemOptions.create({
        data: payload,
        include: {
            organization: { include: { BusinessType: true } },
        },
    });
    return result;
});
const getSingle = (paymentOptionId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.paymentSystemOptions.findUnique({
        where: { id: paymentOptionId },
        include: {
            organization: { include: { BusinessType: true, owner: true } },
        },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Referred code not found');
    }
});
const updateSingle = (userId, userRole, paymentOptionId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (userRole === 'STAFF') {
        const userInfo = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
        });
        if (!userInfo) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User info not found');
        }
        const validStaff = ['STAFF_ADMIN', 'ACCOUNTS_MANAGER'];
        if (!validStaff.includes(userInfo.role)) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only accounts manager and admin staff and owner can change Payment options');
        }
    }
    const result = yield prisma_1.default.paymentSystemOptions.update({
        where: { id: paymentOptionId },
        data: payload,
    });
    return result;
});
const deleteSingle = (userId, userRole, paymentOptionId) => __awaiter(void 0, void 0, void 0, function* () {
    if (userRole === 'STAFF') {
        const userInfo = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
        });
        if (!userInfo) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User info not found');
        }
        const validStaff = ['STAFF_ADMIN', 'ACCOUNTS_MANAGER'];
        if (!validStaff.includes(userInfo.role)) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only accounts manager and admin staff and owner can change Payment options');
        }
    }
    const result = yield prisma_1.default.paymentSystemOptions.delete({
        where: { id: paymentOptionId },
    });
    return result;
});
exports.PaymentSystemOptionsService = {
    createNew,
    getAll,
    getSingle,
    updateSingle,
    deleteSingle,
};
