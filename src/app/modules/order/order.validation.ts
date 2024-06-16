import z from 'zod';

const orderCreateValidation = z.object({
  body: z.object({
    cartId: z.string({ required_error: 'Cart id is required' }),
  }),
});

export const OrderValidation = {
  orderCreateValidation,
};
