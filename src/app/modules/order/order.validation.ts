import z from 'zod';
import { OrderStatusConstant, PaymentStatusConstant } from './order.constant';

const orderCreateValidation = z.object({
  body: z.object({
    shipping_address: z.string({
      required_error: 'Shipping address is required',
    }),
  }),
});
const updateOrderStatusValidation = z.object({
  body: z.object({
    status: z.enum([...OrderStatusConstant] as [string, ...string[]]),
  }),
});
const updatePaymentStatusValidation = z.object({
  body: z.object({
    status: z.enum([...PaymentStatusConstant] as [string, ...string[]]),
  }),
});

export const OrderValidation = {
  orderCreateValidation,
  updateOrderStatusValidation,
  updatePaymentStatusValidation,
};
