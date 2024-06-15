import z from 'zod';

const updateCartSingleValidation = z.object({
  body: z.object({
    action: z.enum(['increment', 'decrement'], {
      required_error: 'Action must needed',
    }),
  }),
});
const updateCartMultipleValidation = z.object({
  body: z.object({
    action: z.enum(['increment', 'decrement'], {
      required_error: 'Action must needed',
    }),
    quantity: z.number({ required_error: 'Quantity is required' }),
  }),
});
const removeCartItemsValidation = z.object({
  body: z.object({
    cartItemIds: z.string({ required_error: 'Cart items array need' }).array(),
  }),
});
export const CartValidation = {
  updateCartSingleValidation,
  updateCartMultipleValidation,
  removeCartItemsValidation,
};
