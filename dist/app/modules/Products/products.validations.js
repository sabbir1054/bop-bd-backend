"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const createProductValidation = zod_1.default.object({
    name: zod_1.default.string({ required_error: 'Product name is required' }),
    description: zod_1.default.string().optional(),
    ownerId: zod_1.default.string({ required_error: 'Owner id is required' }),
    sku: zod_1.default.string({ required_error: 'Product sku code is required' }),
    buying_price: zod_1.default.number().optional(),
    price: zod_1.default.number({ required_error: 'Product selling price is required' }),
    discount_price: zod_1.default.number().optional(),
    stock: zod_1.default.number({ required_error: 'Please enter the stock' }),
    categoryId: zod_1.default.string({ required_error: 'Category id is required' }),
});
const updateProductInfoValidation = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default.string().optional(),
        description: zod_1.default.string().optional(),
        sku: zod_1.default.string().optional(),
        buying_price: zod_1.default.number().optional(),
        price: zod_1.default.number().optional(),
        discount_price: zod_1.default.number().optional(),
        stock: zod_1.default.number().optional(),
        categoryId: zod_1.default.string().optional(),
    }),
});
exports.ProductsValidation = {
    createProductValidation,
    updateProductInfoValidation,
};
