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
exports.staffServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const getAll = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const andConditions = [];
    const isUserExist = yield prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not valid');
    }
    const organizationId = isUserExist.organizationId;
    andConditions.push({ organizationId: organizationId });
    andConditions.push({ role: 'STAFF' });
    const result = yield prisma_1.default.user.findMany({
        where: { AND: andConditions },
        include: {
            Staff: true,
        },
    });
    return result;
});
const getSingle = (userId, staffUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not valid');
    }
    const organizationId = isUserExist.organizationId;
    const result = yield prisma_1.default.user.findUnique({
        where: { id: staffUserId },
        include: { Staff: true },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Staff not found');
    }
    return result;
});
const blockstaff = (userId, userRole, staffId) => __awaiter(void 0, void 0, void 0, function* () {
    let orgId = null;
    if (userRole === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
        });
        if (!isValidStaff || !isValidStaff.isValidNow) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Invalid user');
        }
        if (isValidStaff.role !== 'STAFF_ADMIN') {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You can not block user');
        }
        orgId = isValidStaff.organizationId;
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
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
    }
    const isStaffExist = yield prisma_1.default.staff.findUnique({
        where: { id: staffId },
    });
    if (!isStaffExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Staff info not found');
    }
    if (isStaffExist.organizationId !== orgId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Staff not from your organization');
    }
    const result = yield prisma_1.default.staff.update({
        where: { id: staffId },
        data: { isValidNow: false },
    });
    return result;
});
exports.staffServices = {
    getAll,
    getSingle,
    blockstaff,
};
