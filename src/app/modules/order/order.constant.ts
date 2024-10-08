export const OrderStatusConstant = [
  'PENDING',
  'ACCEPTED',
  'CANCEL',
  'SHIPPING',
  'DELIVERED',
];
export const PaymentStatusConstant = ['PENDING', 'PAID'];

export const ordersSearchableFields: string[] = ['orderCode'];

export const ordersFilterableFields: string[] = [
  'searchTerm',
  'orderStatus',
  'paymentStatus',
];

export const ordersSearchableFieldsAdmin: string[] = ['category'];
export const validStaffRoleForOrderStatusUpdate = [
  'ORDER_SUPERVISOR',
  'STAFF_ADMIN',
  'DELIVERY_BOY',
];
