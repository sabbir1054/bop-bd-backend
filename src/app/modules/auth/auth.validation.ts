import { z } from 'zod';

const userRegistrationValidation = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string({ required_error: 'Phone number is required' }),
    password: z.string({ required_error: 'Password is required' }),
    role: z.string({ required_error: 'Role is required' }),
    businessTypeId: z.string({ required_error: 'Business type is required' }),
  }),
});

const userLoginValidation = z.object({
  body: z.object({
    phone: z.string({ required_error: 'Phone number is required' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});
const refreshTokenZodSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({ required_error: 'Refresh Token is required' }),
  }),
});
export const AuthValidation = {
  userRegistrationValidation,
  userLoginValidation,
  refreshTokenZodSchema,
};
