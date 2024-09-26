export interface IOrderCreate {
  shipping_address: string;
  isInstantRewardUse: boolean;
}

export interface IVerificationDeliveryPayload {
  orderId: string;
  givenOtp: string;
}
export interface IDeliveryAssignData {
  orderId: string;
  deliveryBoyId: string;
}
export type IUpdateOrderPaymentOptions = {
  orderId: string;
  paymentSystemOptionsId: string;
};
