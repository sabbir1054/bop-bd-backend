export type ICreatePymentService = {
  callbackUrl: string;
  amount?: string;
  orgId: string;
  paymentMethod: string;
  isAdjustreward: boolean;
  commissionPayType: 'CASH' | 'REWARD_POINTS';
};
