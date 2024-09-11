export const orderPaymentCategory = [
  'MOBILE_BANKING',
  'BANK_TRANSACTION',
  'CASH_ON_DELIVERY',
];

export type ICreatePaymentOptions = {
  paymentCategory: 'MOBILE_BANKING' | 'BANK_TRANSACTION' | 'CASH_ON_DELIVERY';
  methodName: string;
  accountNumber?: string;
  descripption?: string;
};
