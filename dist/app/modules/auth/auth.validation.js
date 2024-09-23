"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidation = void 0;
const zod_1 = require("zod");
const auth_constant_1 = require("./auth.constant");
const userRegistrationValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        phone: zod_1.z.string({ required_error: 'Phone number is required' }),
        password: zod_1.z.string({ required_error: 'Password is required' }),
        role: zod_1.z.enum([...auth_constant_1.userRole], {
            required_error: 'Role is required',
        }),
        businessTypeId: zod_1.z.string().optional(),
        organizationId: zod_1.z.string().optional(),
        staffRole: zod_1.z.enum([...auth_constant_1.staffRole]).optional(),
        deliveryArea: zod_1.z.string().optional(),
        refferCode: zod_1.z.string().optional(),
    }),
});
const userLoginValidation = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string({ required_error: 'Phone number is required' }),
        password: zod_1.z.string({ required_error: 'Password is required' }),
        isRemember: zod_1.z.boolean().optional(),
    }),
});
const userPasswordValidation = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string({ required_error: 'Phone number is required' }),
        newPassword: zod_1.z.string({ required_error: 'Password is required' }),
    }),
});
const refreshTokenZodSchema = zod_1.z.object({
    cookies: zod_1.z.object({
        refreshToken: zod_1.z.string({ required_error: 'Refresh Token is required' }),
    }),
});
exports.AuthValidation = {
    userRegistrationValidation,
    userLoginValidation,
    refreshTokenZodSchema,
    userPasswordValidation,
};
