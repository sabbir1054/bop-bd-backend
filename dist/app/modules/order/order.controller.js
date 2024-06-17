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
exports.OrderController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const order_service_1 = require("./order.service");
const orderCreate = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield order_service_1.OrderService.orderCreate(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Order placed done',
        data: result,
    });
}));
const getUserIncomingOrders = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const result = yield order_service_1.OrderService.getUserIncomingOrders(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Incoming orders retrieve',
        data: result,
    });
}));
const getUserOutgoingOrders = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const result = yield order_service_1.OrderService.getUserOutgoingOrders(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Outgoing orders retrieve',
        data: result,
    });
}));
const updateOrderStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const { orderId } = req.params;
    const { status } = req.body;
    const result = yield order_service_1.OrderService.updateOrderStatus(userId, orderId, status);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Order status updated ',
        data: result,
    });
}));
const updatePaymentStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const { orderId } = req.params;
    const { status } = req.body;
    const result = yield order_service_1.OrderService.updatePaymentStatus(userId, orderId, status);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Payment status updated ',
        data: result,
    });
}));
exports.OrderController = {
    orderCreate,
    getUserIncomingOrders,
    getUserOutgoingOrders,
    updateOrderStatus,
    updatePaymentStatus,
};
