import { z } from 'zod';
import { staffRole, userRole } from './auth.constant';

const userRegistrationValidation = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string({ required_error: 'Phone number is required' }),
    password: z.string({ required_error: 'Password is required' }),
    role: z.enum([...userRole] as [string, ...string[]], {
      required_error: 'Role is required',
    }),
    businessTypeId: z.string().optional(),
    organizationId: z.string().optional(),
    staffRole: z.enum([...staffRole] as [string, ...string[]]).optional(),
    deliveryAre: z.string().optional(),
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
