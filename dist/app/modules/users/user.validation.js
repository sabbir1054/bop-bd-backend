"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const user_constant_1 = require("./user.constant");
const updateUserProfileValidation = zod_1.default.object({
    memberCategory: zod_1.default
        .enum([...user_constant_1.memberCategory])
        .optional(),
    verified: zod_1.default.boolean().optional(),
    name: zod_1.default.string().optional(),
    email: zod_1.default.string().optional(),
    address: zod_1.default.string().optional(),
    license: zod_1.default.string().optional(),
    nid: zod_1.default.string().optional(),
    businessTypeId: zod_1.default.string().optional(),
    shop_name: zod_1.default.string().optional(),
});
exports.UsersValidation = {
    updateUserProfileValidation,
};
