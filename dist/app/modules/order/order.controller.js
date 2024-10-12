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
const paginationFields_1 = require("../../../constants/paginationFields");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const pick_1 = __importDefault(require("../../../shared/pick"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const order_constant_1 = require("./order.constant");
const order_service_1 = require("./order.service");
const orderCreate = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId, role } = req.user;
    const result = yield order_service_1.OrderService.orderCreate(userId, role, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Order placed done',
        data: result,
    });
}));
const getOrganizationIncomingOrders = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.params;
    const options = (0, pick_1.default)(req.query, paginationFields_1.paginationFields);
    const result = yield order_service_1.OrderService.getOrganizationIncomingOrders(userId, options);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Incoming orders retrieve',
        data: result,
    });
}));
const getOrganizationOutgoingOrders = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.params;
    const options = (0, pick_1.default)(req.query, paginationFields_1.paginationFields);
    const result = yield order_service_1.OrderService.getOrganizationOutgoingOrders(userId, options);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Outgoing orders retrieve',
        data: result,
    });
}));
const updateOrderStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId, role } = req.user;
    const { orderId } = req.params;
    const { status } = req.body;
    const result = yield order_service_1.OrderService.updateOrderStatus(userId, role, orderId, status);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Order status updated ',
        data: result,
    });
}));
const updatePaymentStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId, role } = req.user;
    const { orderId } = req.params;
    const { status } = req.body;
    const result = yield order_service_1.OrderService.updatePaymentStatus(userId, role, orderId, status);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Payment status updated ',
        data: result,
    });
}));
const getSingle = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield order_service_1.OrderService.getSingle(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Order  retrieve',
        data: result,
    });
}));
const updateOrderDeliveryCharge = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.user;
    const { orderId } = req.params;
    const result = yield order_service_1.OrderService.updateOrderDeliveryCharge(id, role, orderId, req.body.deliveryCharge);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Order type retrieve',
        data: result,
    });
}));
const searchFilterIncomingOrders = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.default)(req.query, order_constant_1.ordersFilterableFields);
    const options = (0, pick_1.default)(req.query, paginationFields_1.paginationFields);
    const { id: userId, role } = req.user;
    const result = yield order_service_1.OrderService.searchFilterIncomingOrders(userId, role, filters, options);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Orders retrieve successfully !!',
        meta: result.meta,
        data: result.data,
    });
}));
const searchFilterOutgoingOrders = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.default)(req.query, order_constant_1.ordersFilterableFields);
    const options = (0, pick_1.default)(req.query, paginationFields_1.paginationFields);
    const { id: userId, role } = req.user;
    const result = yield order_service_1.OrderService.searchFilterOutgoingOrders(userId, role, filters, options);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Orders retrieve successfully !!',
        meta: result.meta,
        data: result.data,
    });
}));
const verifyDeliveryOtp = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId, role } = req.user;
    const result = yield order_service_1.OrderService.verifyDeliveryOtp(userId, role, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Order delivered !!',
        data: result,
    });
}));
const assigndForDelivery = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.user;
    const result = yield order_service_1.OrderService.assignForDelivery(id, role, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Delivery assigned',
        data: result,
    });
}));
const getMyOrderForDelivery = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const result = yield order_service_1.OrderService.getMyOrderForDelivery(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Order retrive',
        data: result,
    });
}));
const updateOrderPaymentOptions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.user;
    const result = yield order_service_1.OrderService.updateOrderPaymentOptions(id, role, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Order updated',
        data: result,
    });
}));
exports.OrderController = {
    getOrganizationOutgoingOrders,
    getOrganizationIncomingOrders,
    orderCreate,
    updateOrderStatus,
    updatePaymentStatus,
    getSingle,
    searchFilterIncomingOrders,
    searchFilterOutgoingOrders,
    verifyDeliveryOtp,
    assigndForDelivery,
    getMyOrderForDelivery,
    updateOrderPaymentOptions,
    updateOrderDeliveryCharge,
};
