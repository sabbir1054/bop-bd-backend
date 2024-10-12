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
exports.UserPaymentOptionsService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const createPaymentOptions = (userId, role, payload) => __awaiter(void 0, void 0, void 0, function* () {
    let orgId = null;
    if (role === 'STAFF') {
        const validStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
        });
        if (!validStaff ||
            validStaff.role !== 'STAFF_ADMIN' ||
            !validStaff.isValidNow) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid staff role');
        }
        orgId = validStaff.organizationId;
    }
    else {
        const userInfo = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!userInfo) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User info not found');
        }
        orgId = userInfo.organizationId;
    }
    if (!orgId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
    }
    if (payload.paymentCategory === 'CASH_ON_DELIVERY') {
        const result = yield prisma_1.default.paymentSystemOptions.create({
            data: Object.assign({ organizationId: orgId }, payload),
        });
        return result;
    }
    else {
        if (payload.paymentCategory === 'BANK_TRANSACTION' &&
            !payload.descripption) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Bank information: BRANCH NAME, ADDRESS. ACCOUNT NUMBER REQUIRED');
        }
        if (payload.paymentCategory === 'MOBILE_BANKING' &&
            !payload.accountNumber) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Give information:ACCOUNT NUMBER REQUIRED');
        }
        const result = yield prisma_1.default.paymentSystemOptions.create({
            data: Object.assign({ organizationId: orgId }, payload),
        });
        return result;
    }
});
const organizationAllPaymentOptions = (organizationId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.paymentSystemOptions.findMany({
        where: { organizationId: organizationId },
        include: {
            organization: true,
        },
    });
    return result;
});
const updateorganizationPaymentOptions = (userId, role, organizationId, paymentSystemOptionsId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    let orgId = null;
    if (role === 'STAFF') {
        const validStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
        });
        if (!validStaff ||
            validStaff.role !== 'STAFF_ADMIN' ||
            !validStaff.isValidNow) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid staff role');
        }
        orgId = validStaff.organizationId;
    }
    else {
        const userInfo = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!userInfo) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User info not found');
        }
        orgId = userInfo.organizationId;
    }
    if (!orgId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
    }
    if (orgId !== organizationId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Your organization id not matched');
    }
    const isOrganizationExist = yield prisma_1.default.organization.findUnique({
        where: { id: organizationId },
    });
    if (!isOrganizationExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization not found');
    }
    const isPaymentOptionsExist = yield prisma_1.default.paymentSystemOptions.findUnique({
        where: { id: paymentSystemOptionsId },
        include: {
            organization: true,
        },
    });
    if (!isPaymentOptionsExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Payment options not found');
    }
    if (isPaymentOptionsExist.organizationId !== organizationId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Paymentoptions id not contains in your organization');
    }
    const result = yield prisma_1.default.paymentSystemOptions.update({
        where: { id: paymentSystemOptionsId },
        data: Object.assign({}, payload),
    });
    return result;
});
const deleteorganizationPaymentOptions = (userId, role, organizationId, paymentSystemOptionsId) => __awaiter(void 0, void 0, void 0, function* () {
    let orgId = null;
    if (role === 'STAFF') {
        const validStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
        });
        if (!validStaff ||
            validStaff.role !== 'STAFF_ADMIN' ||
            !validStaff.isValidNow) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid staff role');
        }
        orgId = validStaff.organizationId;
    }
    else {
        const userInfo = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!userInfo) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User info not found');
        }
        orgId = userInfo.organizationId;
    }
    if (!orgId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
    }
    if (orgId !== organizationId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Your organization id not matched');
    }
    const isOrganizationExist = yield prisma_1.default.organization.findUnique({
        where: { id: organizationId },
    });
    if (!isOrganizationExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization not found');
    }
    const isPaymentOptionsExist = yield prisma_1.default.paymentSystemOptions.findUnique({
        where: { id: paymentSystemOptionsId },
        include: {
            organization: true,
        },
    });
    if (!isPaymentOptionsExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Payment options not found');
    }
    if (isPaymentOptionsExist.organizationId !== organizationId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Paymentoptions id not contains in your organization');
    }
    const result = yield prisma_1.default.paymentSystemOptions.delete({
        where: { id: paymentSystemOptionsId },
    });
    return result;
});
exports.UserPaymentOptionsService = {
    createPaymentOptions,
    organizationAllPaymentOptions,
    updateorganizationPaymentOptions,
    deleteorganizationPaymentOptions,
};
