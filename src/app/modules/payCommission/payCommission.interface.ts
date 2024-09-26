export type ICreatePymentService = {
  orgId: string;
  paymentMethod: string;
  commissionPayType: 'CASH' | 'REWARD_POINTS';
};
