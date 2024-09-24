export type ICreatePymentService = {
  amount?: number;
  orgId: string;
  paymentMethod: string;
  commissionPayType: 'CASH' | 'REWARD_POINTS';
};
