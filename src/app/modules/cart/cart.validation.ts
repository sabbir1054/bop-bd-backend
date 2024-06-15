import z from 'zod';

const updateCartSingleValidation = z.object({
  body: z.object({
    action: z.enum(['increment', 'decrement'], {
      required_error: 'Action must needed',
    }),
  }),
});

export const CartValidation = {
  updateCartSingleValidation,
};
