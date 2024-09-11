"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const createFeedbackValidation = zod_1.default.object({
    body: zod_1.default.object({
        rating: zod_1.default
            .number({ required_error: 'Rating is required' })
            .max(5, { message: 'Rating cannot be more than 5' }),
        comment: zod_1.default.string({ required_error: 'Comment is required' }),
        productId: zod_1.default.string({ required_error: 'Product id is required' }),
    }),
});
const updateFeedbackValidation = zod_1.default.object({
    body: zod_1.default.object({
        rating: zod_1.default
            .number({ required_error: 'Rating is required' })
            .max(5, { message: 'Rating cannot be more than 5' })
            .optional(),
        comment: zod_1.default.string({ required_error: 'Comment is required' }).optional(),
    }),
});
exports.FeedbackValidation = {
    createFeedbackValidation,
    updateFeedbackValidation,
};
