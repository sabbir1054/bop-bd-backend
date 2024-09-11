import z from 'zod';
import { orderPaymentCategory } from './userPaymentOptions.constant';
const createUserPaymentOptions = z.object({
  body: z.object({
    paymentCategory: z.enum(
      [...orderPaymentCategory] as [string, ...string[]],
      { required_error: 'Payment category ' },
    ),
    methodName: z.string({ required_error: 'Method name is required' }),
    accountNumber: z
      .string({ required_error: 'Account number is required' })
      .optional(),
    description: z.string().optional(),
  }),
});
const updateUserPaymentOptions = z.object({
  body: z.object({
    paymentCategory: z
      .enum([...orderPaymentCategory] as [string, ...string[]], {
        required_error: 'Payment category ',
      })
      .optional(),
    methodName: z
      .string({ required_error: 'Method name is required' })
      .optional(),
    accountNumber: z
      .string({ required_error: 'Account number is required' })
      .optional(),
    description: z.string().optional(),
  }),
});

export const UserPaymentOptionsValidation = {
  createUserPaymentOptions,
  updateUserPaymentOptions,
};
