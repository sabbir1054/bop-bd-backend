export interface IOrderCreate {
  cartId: string;
  shipping_address: string;
}

export interface IVerificationDeliveryPayload {
  orderId: string;
  givenOtp: string;
}
