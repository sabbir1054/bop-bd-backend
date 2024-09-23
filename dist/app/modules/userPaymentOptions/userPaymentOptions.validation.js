"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPaymentOptionsValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const userPaymentOptions_constant_1 = require("./userPaymentOptions.constant");
const createUserPaymentOptions = zod_1.default.object({
    body: zod_1.default.object({
        paymentCategory: zod_1.default.enum([...userPaymentOptions_constant_1.orderPaymentCategory], { required_error: 'Payment category ' }),
        methodName: zod_1.default.string({ required_error: 'Method name is required' }),
        accountNumber: zod_1.default
            .string({ required_error: 'Account number is required' })
            .optional(),
        description: zod_1.default.string().optional(),
    }),
});
const updateUserPaymentOptions = zod_1.default.object({
    body: zod_1.default.object({
        paymentCategory: zod_1.default
            .enum([...userPaymentOptions_constant_1.orderPaymentCategory], {
            required_error: 'Payment category ',
        })
            .optional(),
        methodName: zod_1.default
            .string({ required_error: 'Method name is required' })
            .optional(),
        accountNumber: zod_1.default
            .string({ required_error: 'Account number is required' })
            .optional(),
        description: zod_1.default.string().optional(),
    }),
});
exports.UserPaymentOptionsValidation = {
    createUserPaymentOptions,
    updateUserPaymentOptions,
};
