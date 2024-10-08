"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessTypeZodValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const createBusinessTypeValidation = zod_1.default.object({
    body: zod_1.default.object({
        typeName: zod_1.default.string({
            required_error: 'Type name is required name is required',
        }),
        typeName_bn: zod_1.default.string({
            required_error: 'Type name in bangla is required name is required',
        }),
    }),
});
const updateBusinessTypeValidation = zod_1.default.object({
    body: zod_1.default.object({
        typeName: zod_1.default
            .string({
            required_error: 'Type name is required name is required',
        })
            .optional(),
        typeName_bn: zod_1.default
            .string({
            required_error: 'Type name in bangla is required name is required',
        })
            .optional(),
    }),
});
exports.BusinessTypeZodValidation = {
    createBusinessTypeValidation,
    updateBusinessTypeValidation,
};
