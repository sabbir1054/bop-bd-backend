import z from 'zod';
import { OrderPaymentCategory } from './paymentOptions.constant';

const createPaymentOptionsValidation = z.object({
  body: z.object({
    paymentCategory: z.enum(
      [...OrderPaymentCategory] as [string, ...string[]],
      { required_error: 'Payment category is required' },
    ),
    methodName: z.string({ required_error: 'Method Name is required' }),
    accountNumber: z.string({ required_error: 'Account number is required' }),
    description: z.string().optional(),
    organizationId: z.string({ required_error: 'Organization id is required' }),
  }),
});
const updatePaymentOptionsValidation = z.object({
  body: z.object({
    paymentCategory: z
      .enum([...OrderPaymentCategory] as [string, ...string[]], {
        required_error: 'Payment category is required',
      })
      .optional(),
    methodName: z
      .string({ required_error: 'Method Name is required' })
      .optional(),
    accountNumber: z
      .string({ required_error: 'Account number is required' })
      .optional(),
    description: z.string().optional(),
  }),
});

export const PaymentOptionsZodValidation = {
  createPaymentOptionsValidation,
  updatePaymentOptionsValidation,
};
