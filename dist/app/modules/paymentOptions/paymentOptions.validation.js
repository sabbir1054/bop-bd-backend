"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentOptionsZodValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const paymentOptions_constant_1 = require("./paymentOptions.constant");
const createPaymentOptionsValidation = zod_1.default.object({
    body: zod_1.default.object({
        paymentCategory: zod_1.default.enum([...paymentOptions_constant_1.OrderPaymentCategory], { required_error: 'Payment category is required' }),
        methodName: zod_1.default.string({ required_error: 'Method Name is required' }),
        accountNumber: zod_1.default.string({ required_error: 'Account number is required' }),
        description: zod_1.default.string().optional(),
        organizationId: zod_1.default.string({ required_error: 'Organization id is required' }),
    }),
});
const updatePaymentOptionsValidation = zod_1.default.object({
    body: zod_1.default.object({
        paymentCategory: zod_1.default
            .enum([...paymentOptions_constant_1.OrderPaymentCategory], {
            required_error: 'Payment category is required',
        })
            .optional(),
        methodName: zod_1.default
            .string({ required_error: 'Method Name is required' })
            .optional(),
        accountNumber: zod_1.default
            .string({ required_error: 'Account number is required' })
            .optional(),
        description: zod_1.default.string().optional(),
    }),
});
exports.PaymentOptionsZodValidation = {
    createPaymentOptionsValidation,
    updatePaymentOptionsValidation,
};
