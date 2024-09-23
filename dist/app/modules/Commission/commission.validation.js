"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionZodValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const commission_constant_1 = require("./commission.constant");
const commissionCreateValidation = zod_1.default.object({
    body: zod_1.default.object({
        commissionType: zod_1.default.enum([...commission_constant_1.commissionType], {
            required_error: 'Commission type is required',
        }),
        percentage: zod_1.default.number({ required_error: 'Percentage number is required' }),
        membershipCategory: zod_1.default.enum([...commission_constant_1.membershipCategory], { required_error: 'Membership category is required' }),
    }),
});
const commissionUpdateValidation = zod_1.default.object({
    body: zod_1.default.object({
        commissionType: zod_1.default
            .enum([...commission_constant_1.commissionType], {
            required_error: 'Commission type is required',
        })
            .optional(),
        percentage: zod_1.default
            .number({ required_error: 'Percentage number is required' })
            .optional(),
        isValid: zod_1.default
            .boolean({ required_error: 'Is valid filed is required' })
            .optional(),
        membershipCategory: zod_1.default
            .enum([...commission_constant_1.membershipCategory], {
            required_error: 'Membership category is required',
        })
            .optional(),
    }),
});
exports.CommissionZodValidation = {
    commissionCreateValidation,
    commissionUpdateValidation,
};
