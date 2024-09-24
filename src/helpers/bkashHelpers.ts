import axios from 'axios';
import config from '../config';

export const startGrantToken = async () => {
  const grantToke = config.bkashConfig.grantTokenLink;
  const response = await axios.post(
    `${grantToke}`,
    {
      app_key: config.bkashConfig.appKey,
      app_secret: config.bkashConfig.appSecretKey,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        username: config.bkashConfig.username,
        password: config.bkashConfig.password,
      },
    },
  );
  return response;
};
export type ICreatePaymentPayload = {
  amount: string;
  id_token: string;
  payComID: string;
  orgId: string;
};
export const startCreatePayment = async (payload: ICreatePaymentPayload) => {
  const callBackUrl = config.bkashConfig.callBackURL;
  const createPaymentLink = config.bkashConfig.createPaymentLink;
  const requestBody = {
    mode: '0011',
    payerReference: payload.orgId,
    callbackURL: callBackUrl,
    amount: payload.amount,
    currency: 'BDT',
    intent: 'sale',
    merchantInvoiceNumber: payload.payComID,
  };
  const response = await axios.post(
    `${createPaymentLink}`,
    {
      ...requestBody,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: payload.id_token,
        'X-App-Key': config.bkashConfig.appKey,
      },
    },
  );
  return response;
};

export const startExecutePayment = async (
  paymentID: string,
  id_token: string,
) => {
  const executePaymentLink = config.bkashConfig.executePaymentLink;
  const response = await axios.post(
    `${executePaymentLink}`,
    {
      paymentID: paymentID,
    },
    {
      headers: {
        Accept: 'application/json',
        Authorization: id_token,
        'X-App-Key': config.bkashConfig.appKey,
      },
    },
  );

  return response;
};
