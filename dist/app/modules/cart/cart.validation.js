"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const updateCartSingleValidation = zod_1.default.object({
    body: zod_1.default.object({
        action: zod_1.default.enum(['increment', 'decrement'], {
            required_error: 'Action must needed',
        }),
    }),
});
const updateCartMultipleValidation = zod_1.default.object({
    body: zod_1.default.object({
        action: zod_1.default.enum(['increment', 'decrement'], {
            required_error: 'Action must needed',
        }),
        quantity: zod_1.default.number({ required_error: 'Quantity is required' }),
    }),
});
const removeCartItemsValidation = zod_1.default.object({
    body: zod_1.default.object({
        cartItemIds: zod_1.default.string({ required_error: 'Cart items array need' }).array(),
    }),
});
exports.CartValidation = {
    updateCartSingleValidation,
    updateCartMultipleValidation,
    removeCartItemsValidation,
};
