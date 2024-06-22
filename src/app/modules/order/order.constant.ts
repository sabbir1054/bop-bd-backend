export const OrderStatusConstant = [
  'PENDING',
  'ACCEPTED',
  'CANCEL',
  'SHIPPING',
  'DELIVERED',
];
export const PaymentStatusConstant = ['PENDING', 'PAID'];

export const ordersSearchableFields: string[] = ['orderCode', 'phone'];

export const ordersFilterableFields: string[] = [
  'searchTerm',
  'orderStatus',
  'paymentStatus',
];
