import z from 'zod';
import { OrderStatusConstant, PaymentStatusConstant } from './order.constant';

const orderCreateValidation = z.object({
  body: z.object({
    isInstantRewardUse: z.boolean({
      required_error: 'Is instant reward use value is required',
    }),
    shipping_address: z.string({
      required_error: 'Shipping address is required',
    }),
  }),
});
const updateOrderPaymentOption = z.object({
  body: z.object({
    paymentSystemOptionsId: z.string({
      required_error: 'Payment option id required',
    }),
    orderId: z.string({
      required_error: 'Order id required',
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
const updateOrderDeliveryCharge = z.object({
  body: z.object({
    deliveryCharge: z.number({ required_error: 'Please set deliveryCharge' }),
  }),
});
export const OrderValidation = {
  orderCreateValidation,
  updateOrderStatusValidation,
  updatePaymentStatusValidation,
  assignForDeliveryValidation,
  updateOrderPaymentOption,
  updateOrderDeliveryCharge,
};
