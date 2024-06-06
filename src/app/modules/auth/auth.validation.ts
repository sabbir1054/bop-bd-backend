import { z } from 'zod';

const userRegistrationValidation = z.object({
  body: z.object({
    phone: z.string({ required_error: 'Phone number is required' }),
    password: z.string({ required_error: 'Password is required' }),
    role: z.string({ required_error: 'Role is required' }),
  }),
});

const userLoginValidation = z.object({
  body: z.object({
    phone: z.string({ required_error: 'Phone number is required' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});
export const AuthValidation = {
  userRegistrationValidation,
  userLoginValidation,
};
