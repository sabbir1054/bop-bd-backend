export interface IOrderCreate {
  shipping_address: string;
}

export interface IVerificationDeliveryPayload {
  orderId: string;
  givenOtp: string;
}
export interface IDeliveryAssignData {
  orderId: string;
  deliveryBoyId: string;
}
