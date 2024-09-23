import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import {
  startCreatePayment,
  startExecutePayment,
  startGrantToken,
} from '../../../helpers/bkashHelpers';
import { ICreatePymentService } from './payCommission.interface';

const createPayment = async (payload: ICreatePymentService) => {
  const grantTokenResponse = await startGrantToken();

  if (!grantTokenResponse || grantTokenResponse.data.statusCode !== '0000') {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Payment not start , ',
    );
  }

  if (!grantTokenResponse.data.id_token) {
    throw new ApiError(httpStatus.NOT_FOUND, ' Session not started');
  }

  const createPaymentData = {
    callbackUrl: payload.callbackUrl,
    amount: payload.amount,
    orgId: payload.orgId,
    id_token: grantTokenResponse.data.id_token,
  };
  const startCreatePaymentResponse =
    await startCreatePayment(createPaymentData);

  if (
    !startCreatePaymentResponse ||
    startCreatePaymentResponse.data.statusCode !== '0000'
  ) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Payment not create');
  }

  if (
    !startCreatePaymentResponse.data.bkashURL ||
    !startCreatePaymentResponse.data.paymentID
  ) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'No payment id info create',
    );
  }
  return {
    paymentID: startCreatePaymentResponse.data.paymentID,
    bkashURL: startCreatePaymentResponse.data.bkashURL,
    id_token: grantTokenResponse.data.id_token,
  };
};

const executePaymentHit = async (paymentID: string, id_token: string) => {
  const executeResponse = await startExecutePayment(paymentID, id_token);
  return executeResponse.data;
};

export const PayCommissionServices = {
  createPayment,
  executePaymentHit,
};
