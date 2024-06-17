"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidation = void 0;
const zod_1 = require("zod");
const userRegistrationValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        phone: zod_1.z.string({ required_error: 'Phone number is required' }),
        password: zod_1.z.string({ required_error: 'Password is required' }),
        role: zod_1.z.string({ required_error: 'Role is required' }),
    }),
});
const userLoginValidation = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string({ required_error: 'Phone number is required' }),
        password: zod_1.z.string({ required_error: 'Password is required' }),
    }),
});
exports.AuthValidation = {
    userRegistrationValidation,
    userLoginValidation,
};
