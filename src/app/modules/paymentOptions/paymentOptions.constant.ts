export const OrderPaymentCategory = [
  'MOBILE_BANKING',
  'BANK_TRANSACTION',
  'CASH_ON_DELIVERY',
];
export type IPaymentOptionPayload = {
  paymentCategory: 'MOBILE_BANKING' | 'BANK_TRANSACTION' | 'CASH_ON_DELIVERY';
  methodName: string;
  accountNumber?: string;
  description?: string;
  organizationId?: string;
};
