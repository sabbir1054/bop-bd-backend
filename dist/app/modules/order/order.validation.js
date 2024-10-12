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
        isInstantRewardUse: zod_1.default.boolean({
            required_error: 'Is instant reward use value is required',
        }),
        shipping_address: zod_1.default.string({
            required_error: 'Shipping address is required',
        }),
    }),
});
const updateOrderPaymentOption = zod_1.default.object({
    body: zod_1.default.object({
        paymentSystemOptionsId: zod_1.default.string({
            required_error: 'Payment option id required',
        }),
        orderId: zod_1.default.string({
            required_error: 'Order id required',
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
const assignForDeliveryValidation = zod_1.default.object({
    body: zod_1.default.object({
        orderId: zod_1.default.string({ required_error: 'Order id is required' }),
        deliveryBoyId: zod_1.default.string({ required_error: 'Delivery boy id is required ' }),
    }),
});
const updateOrderDeliveryCharge = zod_1.default.object({
    body: zod_1.default.object({
        deliveryCharge: zod_1.default.number({ required_error: 'Please set deliveryCharge' }),
    }),
});
exports.OrderValidation = {
    orderCreateValidation,
    updateOrderStatusValidation,
    updatePaymentStatusValidation,
    assignForDeliveryValidation,
    updateOrderPaymentOption,
    updateOrderDeliveryCharge,
};
