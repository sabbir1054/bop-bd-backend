"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayCommissionZodValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const createPaymentValidation = zod_1.default.object({
    body: zod_1.default.object({
        amount: zod_1.default.number().optional(),
        orgId: zod_1.default.string({ required_error: 'Organization id is required' }),
        paymentMethod: zod_1.default.string({
            required_error: 'Payment method name is required',
        }),
        commissionPayType: zod_1.default.enum(['CASH', 'REWARD_POINTS'], {
            required_error: 'Commission pay type is required',
        }),
    }),
});
exports.PayCommissionZodValidation = {
    createPaymentValidation,
};
