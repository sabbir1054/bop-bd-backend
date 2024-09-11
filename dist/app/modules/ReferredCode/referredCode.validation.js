"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferredCodeValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const createReferredCodeValidation = zod_1.default.object({
    body: zod_1.default.object({
        codeOwnerorganizationId: zod_1.default.string({
            required_error: 'Code owned organization id is required',
        }),
    }),
});
const updateReferredCodeValidation = zod_1.default.object({
    body: zod_1.default.object({
        codeOwnerorganizationId: zod_1.default
            .string({
            required_error: 'Code owned organization id is required',
        })
            .optional(),
    }),
});
exports.ReferredCodeValidation = {
    createReferredCodeValidation,
    updateReferredCodeValidation,
};
