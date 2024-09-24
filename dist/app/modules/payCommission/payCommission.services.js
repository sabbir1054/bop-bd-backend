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
exports.PayCommissionServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const bkashHelpers_1 = require("../../../helpers/bkashHelpers");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const createPayment = (payload, userId, userRole) => __awaiter(void 0, void 0, void 0, function* () {
    const isValidOrganization = yield prisma_1.default.organization.findUnique({
        where: { id: payload.orgId },
    });
    if (!isValidOrganization) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not fount');
    }
    // staff and owner validation
    if (userRole === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
        });
        if (!isValidStaff) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Staff info not fount');
        }
        const validStaffRole = ['STAFF_ADMIN', 'ACCOUNTS_MANAGER'];
        if (!validStaffRole.includes(isValidStaff.role)) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Staff role not valid');
        }
        if (payload.orgId !== isValidStaff.organizationId) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Your organization id not match');
        }
    }
    else {
        const isValidUser = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!isValidUser) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Your info not found');
        }
        if (payload.orgId !== isValidUser.organizationId) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Your organization id not match');
        }
    }
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        //   const payCommissionData = {
        //     organizationId: payload.orgId,
        //  }
        const grantTokenResponse = yield (0, bkashHelpers_1.startGrantToken)();
        if (!grantTokenResponse || grantTokenResponse.data.statusCode !== '0000') {
            throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Payment not start , ');
        }
        if (!grantTokenResponse.data.id_token) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, ' Session not started');
        }
        const createPaymentData = {
            callbackUrl: payload.callbackUrl,
            amount: payload.amount,
            orgId: payload.orgId,
            id_token: grantTokenResponse.data.id_token,
        };
        const startCreatePaymentResponse = yield (0, bkashHelpers_1.startCreatePayment)(createPaymentData);
        if (!startCreatePaymentResponse ||
            startCreatePaymentResponse.data.statusCode !== '0000') {
            throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Payment not create');
        }
        if (!startCreatePaymentResponse.data.bkashURL ||
            !startCreatePaymentResponse.data.paymentID) {
            throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'No payment id info create');
        }
        //v
        const setToken = yield prisma.commissionTrnxToken.create({
            data: {
                paymentID: startCreatePaymentResponse.data.paymentID,
                token: grantTokenResponse.data.id_token,
            },
        });
        if (!setToken.paymentID) {
            throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Token not save db');
        }
        return {
            bkashURL: startCreatePaymentResponse.data.bkashURL,
        };
    }));
    return result;
});
const executePaymentHit = (paymentID) => __awaiter(void 0, void 0, void 0, function* () {
    const isPaymentExist = yield prisma_1.default.commissionTrnxToken.findUnique({
        where: { paymentID: paymentID },
    });
    if (!isPaymentExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Payment id not found');
    }
    const executeResponse = yield (0, bkashHelpers_1.startExecutePayment)(paymentID, isPaymentExist.token);
    if (executeResponse.data.statusCode !== '0000') {
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Payment not successfull, create again');
    }
    else {
        const removeToken = yield prisma_1.default.commissionTrnxToken.delete({
            where: { id: isPaymentExist.id },
        });
        if (!removeToken) {
            throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Payment not successfull, create again 2');
        }
    }
    return executeResponse.data;
});
exports.PayCommissionServices = {
    createPayment,
    executePaymentHit,
};
