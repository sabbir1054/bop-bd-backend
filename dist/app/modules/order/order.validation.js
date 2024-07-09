"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const order_constant_1 = require("./order.constant");
const orderCreateValidation = zod_1.default.object({
    body: zod_1.default.object({
        shipping_address: zod_1.default.string({
            required_error: 'Shipping address is required',
        }),
    }),
});
const updateOrderStatusValidation = zod_1.default.object({
    body: zod_1.default.object({
        status: zod_1.default.enum([...order_constant_1.OrderStatusConstant]),
    }),
});
const updatePaymentStatusValidation = zod_1.default.object({
    body: zod_1.default.object({
        status: zod_1.default.enum([...order_constant_1.PaymentStatusConstant]),
    }),
});
exports.OrderValidation = {
    orderCreateValidation,
    updateOrderStatusValidation,
    updatePaymentStatusValidation,
};
