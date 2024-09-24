import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import {
  startCreatePayment,
  startExecutePayment,
  startGrantToken,
} from '../../../helpers/bkashHelpers';
import prisma from '../../../shared/prisma';
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
  const setToken = await prisma.commissionTrnxToken.create({
    data: {
      paymentID: startCreatePaymentResponse.data.paymentID,
      token: grantTokenResponse.data.id_token,
    },
  });

  if (!setToken.paymentID) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Token not save db');
  }
  return {
    bkashURL: startCreatePaymentResponse.data.bkashURL,
  };
};

const executePaymentHit = async (paymentID: string) => {
  const isPaymentExist = await prisma.commissionTrnxToken.findUnique({
    where: { paymentID: paymentID },
  });
  if (!isPaymentExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment id not found');
  }
  const executeResponse = await startExecutePayment(
    paymentID,
    isPaymentExist.token,
  );

  if (executeResponse.data.statusCode !== '0000') {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Payment not successfull, create again',
    );
  } else {
    const removeToken = await prisma.commissionTrnxToken.delete({
      where: { id: isPaymentExist.id },
    });
    if (!removeToken) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Payment not successfull, create again 2',
      );
    }
  }
  return executeResponse.data;
};

export const PayCommissionServices = {
  createPayment,
  executePaymentHit,
};
