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
const assignForDeliveryValidation = z.object({
  body: z.object({
    orderId: z.string({ required_error: 'Order id is required' }),
    deliveryBoyId: z.string({ required_error: 'Delivery boy id is required ' }),
  }),
});

export const OrderValidation = {
  orderCreateValidation,
  updateOrderStatusValidation,
  updatePaymentStatusValidation,
  assignForDeliveryValidation,
};
