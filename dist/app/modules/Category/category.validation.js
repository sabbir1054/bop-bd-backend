"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryZodValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const createCategoryValidation = zod_1.default.object({
    body: zod_1.default.object({
        eng_name: zod_1.default.string({ required_error: 'English category name is required' }),
        bn_name: zod_1.default.string({ required_error: 'Bangla category name is required' }),
    }),
});
const updateCategoryValidation = zod_1.default.object({
    body: zod_1.default.object({
        eng_name: zod_1.default.string().optional(),
        bn_name: zod_1.default.string().optional(),
    }),
});
exports.CategoryZodValidation = {
    createCategoryValidation,
    updateCategoryValidation,
};
