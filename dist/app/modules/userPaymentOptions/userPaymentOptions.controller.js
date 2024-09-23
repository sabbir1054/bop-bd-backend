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
exports.UserPaymentOptionsController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const usePaymentOptions_services_1 = require("./usePaymentOptions.services");
const createPaymentOptions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId, role } = req.user;
    const result = yield usePaymentOptions_services_1.UserPaymentOptionsService.createPaymentOptions(userId, role, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Payment system options created',
        data: result,
    });
}));
const organizationAllPaymentOptions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { organizationId } = req.params;
    const result = yield usePaymentOptions_services_1.UserPaymentOptionsService.organizationAllPaymentOptions(organizationId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Payment system options created',
        data: result,
    });
}));
const updateOrganizationPaymentOptions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId, role } = req.user;
    const { organizationId, paymentSystemOptionsId } = req.params;
    const result = yield usePaymentOptions_services_1.UserPaymentOptionsService.updateorganizationPaymentOptions(userId, role, organizationId, paymentSystemOptionsId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Payment system options updated',
        data: result,
    });
}));
const deleteorganizationPaymentOptions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId, role } = req.user;
    const { organizationId, paymentSystemOptionsId } = req.params;
    const result = yield usePaymentOptions_services_1.UserPaymentOptionsService.deleteorganizationPaymentOptions(userId, role, organizationId, paymentSystemOptionsId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Payment system options updated',
        data: result,
    });
}));
exports.UserPaymentOptionsController = {
    createPaymentOptions,
    organizationAllPaymentOptions,
    updateOrganizationPaymentOptions,
    deleteorganizationPaymentOptions,
};
