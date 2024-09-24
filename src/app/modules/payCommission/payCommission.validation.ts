import z from 'zod';

const createPaymentValidation = z.object({
  body: z.object({
    amount: z.number().optional(),
    orgId: z.string({ required_error: 'Organization id is required' }),
    paymnetMethod: z.string({
      required_error: 'Payment method name is required',
    }),
    commissionPayType: z.enum(['CASH', 'REWARD_POINTS'], {
      required_error: 'Commission pay type is required',
    }),
  }),
});

export const PayCommissionZodValidation = {
  createPaymentValidation,
};
