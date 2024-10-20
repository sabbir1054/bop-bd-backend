import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import {
  startCreatePayment,
  startExecutePayment,
  startGrantToken,
} from '../../../helpers/bkashHelpers';
import prisma from '../../../shared/prisma';
import { ICreatePymentService } from './payCommission.interface';

const createPayment = async (
  payload: ICreatePymentService,
  userId: string,
  userRole: string,
) => {
  const isValidOrganization = await prisma.organization.findUnique({
    where: { id: payload.orgId },
  });

  if (!isValidOrganization) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not fount');
  }
  // staff and owner validation
  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
    });

    if (!isValidStaff || !isValidStaff.isValidNow) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff info not fount');
    }
    const validStaffRole = ['STAFF_ADMIN', 'ACCOUNTS_MANAGER'];

    if (!validStaffRole.includes(isValidStaff.role)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff role not valid');
    }

    if (payload.orgId !== isValidStaff.organizationId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Your organization id not match',
      );
    }
  } else {
    const isValidUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!isValidUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Your info not found');
    }
    if (payload.orgId !== isValidUser.organizationId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Your organization id not match',
      );
    }
  }

  if (isValidOrganization.totalCommission <= 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You have nothing to pay');
  }

  const result = await prisma.$transaction(async prisma => {
    const valueOfPoint = await prisma.pointsValue.findFirst();

    if (!valueOfPoint && payload.commissionPayType === 'REWARD_POINTS') {
      throw new ApiError(httpStatus.NOT_FOUND, 'Points value not set');
    }
    if (!valueOfPoint || !valueOfPoint.perPointsTk) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Points value not set 2');
    }

    // //* convert point to taka
    const rewardConvertedToAmount = (
      valueOfPoint.perPointsTk * isValidOrganization.totalRewardPoints
    ).toFixed(2);

    if (payload.commissionPayType === 'REWARD_POINTS') {
      //* set amount
      let amount = null;
      if (
        isValidOrganization.totalCommission ===
        parseFloat(rewardConvertedToAmount)
      ) {
        amount = rewardConvertedToAmount;
        await prisma.claimReward.create({
          data: {
            claimedAmount: parseFloat(rewardConvertedToAmount),
            points: isValidOrganization.totalRewardPoints,
            organizationId: isValidOrganization.id,
          },
        });

        await prisma.organization.update({
          where: { id: isValidOrganization.id },
          data: { totalRewardPoints: 0, totalCommission: 0 },
        });

        return { bkashURL: '' };
      }
      if (
        isValidOrganization.totalCommission <
        parseFloat(rewardConvertedToAmount)
      ) {
        const restRewardAmount =
          parseFloat(rewardConvertedToAmount) -
          isValidOrganization.totalCommission;

        const restRewardAmountInPoint =
          restRewardAmount / valueOfPoint.perPointsTk;
        const claimdPoint =
          isValidOrganization.totalCommission / valueOfPoint.perPointsTk;
        await prisma.claimReward.create({
          data: {
            claimedAmount: isValidOrganization.totalCommission,
            points: claimdPoint,
            organizationId: isValidOrganization.id,
          },
        });

        await prisma.organization.update({
          where: { id: isValidOrganization.id },
          data: {
            totalCommission: 0,
            totalRewardPoints: restRewardAmountInPoint,
          },
        });
        return { bkashURL: '' };
      }
      if (
        isValidOrganization.totalCommission >
        parseFloat(rewardConvertedToAmount)
      ) {
        //! adjusted amount
        amount =
          isValidOrganization.totalCommission -
          parseFloat(rewardConvertedToAmount);

        if (!amount) {
          throw new ApiError(httpStatus.NOT_FOUND, 'Amount not found');
        }
        //* commssion create
        const createPayCommission = await prisma.payCommission.create({
          data: {
            organizationId: payload.orgId,
            amount: amount,
            commissionPayType: payload.commissionPayType,
          },
        });
        //* token create
        const grantTokenResponse = await startGrantToken();
        if (
          !grantTokenResponse ||
          grantTokenResponse.data.statusCode !== '0000'
        ) {
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Payment not start , ',
          );
        }

        if (!grantTokenResponse.data.id_token) {
          throw new ApiError(httpStatus.NOT_FOUND, ' Session not started');
        }

        const createPaymentData = {
          amount: amount.toString(),
          payComID: createPayCommission.id,
          orgId: payload.orgId,
          id_token: grantTokenResponse.data.id_token.toString(),
        };
        if (!createPaymentData.amount) {
          throw new ApiError(httpStatus.NOT_FOUND, '');
        }
        const startCreatePaymentResponse =
          await startCreatePayment(createPaymentData);

        if (
          !startCreatePaymentResponse ||
          startCreatePaymentResponse.data.statusCode !== '0000'
        ) {
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Payment not create',
          );
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

        //v

        const setToken = await prisma.commissionTrnxToken.create({
          data: {
            paymentID: startCreatePaymentResponse.data.paymentID,
            token: grantTokenResponse.data.id_token,
            cashDeductionType: 'PARTIAL',
          },
        });
        if (!setToken.paymentID) {
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Token not save db',
          );
        }
        /* await prisma.organization.update({
          where: { id: isValidOrganization.id },
          data: { totalRewardPoints: 0, totalCommission: 0 },
        }); */

        return {
          bkashURL: startCreatePaymentResponse.data.bkashURL,
        };
      }
    }
    //! pay with cash
    else {
      //* commssion create
      const createPayCommission = await prisma.payCommission.create({
        data: {
          organizationId: payload.orgId,
          amount: isValidOrganization.totalCommission,
          commissionPayType: payload.commissionPayType,
        },
      });

      //* token create
      const grantTokenResponse = await startGrantToken();
      if (
        !grantTokenResponse ||
        grantTokenResponse.data.statusCode !== '0000'
      ) {
        throw new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Payment not start , ',
        );
      }

      if (!grantTokenResponse.data.id_token) {
        throw new ApiError(httpStatus.NOT_FOUND, ' Session not started');
      }

      const createPaymentData = {
        amount: isValidOrganization.totalCommission.toString(),
        payComID: createPayCommission.id,
        orgId: payload.orgId,
        id_token: grantTokenResponse.data.id_token.toString(),
      };
      if (!createPaymentData.amount) {
        throw new ApiError(httpStatus.NOT_FOUND, '');
      }
      const startCreatePaymentResponse =
        await startCreatePayment(createPaymentData);

      if (
        !startCreatePaymentResponse ||
        startCreatePaymentResponse.data.statusCode !== '0000'
      ) {
        throw new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Payment not create',
        );
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

      //v

      const setToken = await prisma.commissionTrnxToken.create({
        data: {
          paymentID: startCreatePaymentResponse.data.paymentID,
          token: grantTokenResponse.data.id_token,
          cashDeductionType: 'FULL',
        },
      });
      if (!setToken.paymentID) {
        throw new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Token not save db',
        );
      }
      /*       await prisma.organization.update({
        where: { id: isValidOrganization.id },
        data: {
          totalCommission: 0,
        },
      }); */
      return {
        bkashURL: startCreatePaymentResponse.data.bkashURL,
      };
    }
  });

  return result;
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
  const result = await prisma.$transaction(async prisma => {
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
    //* organization info
    const organizationInfo = await prisma.organization.findUnique({
      where: {
        id: executeResponse.data.payerReference,
      },
    });
    //* points value info
    const pointsValue = await prisma.pointsValue.findFirst();
    const createTransactionPaycommission =
      await prisma.transactionInfoForPayCommission.create({
        data: {
          paymentID: executeResponse.data.paymentID,
          trxID: executeResponse.data.trxID,
          transactionStatus: executeResponse.data.transactionStatus,
          amount: parseFloat(executeResponse.data.amount),
          currency: executeResponse.data.currency,
          intent: executeResponse.data.intent,
          paymentExecuteTime:
            executeResponse.data.paymentExecuteTime.toString(),
          merchantInvoiceNumber: executeResponse.data.merchantInvoiceNumber, //pay commission id
          payerReference: executeResponse.data.payerReference, //organization id
          customerMsisdn: executeResponse.data.customerMsisdn,
          statusCode: executeResponse.data.statusCode,
          statusMessage: executeResponse.data.statusMessage,
          payCommissionId: executeResponse.data.merchantInvoiceNumber,
        },
      });

    const payCommissionInfo = await prisma.payCommission.findUnique({
      where: { id: createTransactionPaycommission.payCommissionId },
    });
    if (!payCommissionInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Pay commission info not found');
    }
    if (payCommissionInfo.commissionPayType === 'CASH') {
      await prisma.organization.update({
        where: { id: createTransactionPaycommission.payerReference },
        data: {
          totalCommission: 0,
        },
      });
    } else {
      if (!pointsValue?.perPointsTk || !organizationInfo?.totalRewardPoints) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          'Points value or your reward not found',
        );
      }
      //* reawd point calc
      // const countUsesReward =
      //   pointsValue.perPointsTk * organizationInfo.totalRewardPoints -
      //   createTransactionPaycommission.amount;

      // await prisma.organization.update({
      //   where: { id: createTransactionPaycommission.payerReference },
      //   data: {
      //     totalRewardPoints:
      //       countUsesReward <= 0
      //         ? 0
      //         : countUsesReward / pointsValue.perPointsTk,
      //     totalCommission: { decrement: createTransactionPaycommission.amount },
      //   },
      // });
    }
    return createTransactionPaycommission;
  });
  return result;
};

const getOrganizationPayCommissionHistory = async (
  userId: string,
  userRole: string,
) => {
  let orgId = null;
  // staff and owner validation
  if (userRole === 'STAFF') {
    const isValidStaff = await prisma.staff.findUnique({
      where: { staffInfoId: userId },
    });

    if (!isValidStaff || !isValidStaff.isValidNow) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Staff info not fount');
    }
    const validStaffRole = ['STAFF_ADMIN', 'ACCOUNTS_MANAGER'];

    if (!validStaffRole.includes(isValidStaff.role)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Staff role not valid');
    }

    orgId = isValidStaff.organizationId;
  } else {
    const isValidUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!isValidUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Your info not found');
    }
    orgId = isValidUser.organizationId;
  }
  if (!orgId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Organization info not found');
  }
  const result = await prisma.payCommission.findMany({
    where: {
      AND: [
        { organizationId: orgId },
        {
          transactionDetails: {
            some: {
              statusCode: '0000',
            },
          },
        },
      ],
    },
    include: {
      transactionDetails: true,
    },
  });
  return result;
};

export const PayCommissionServices = {
  createPayment,
  executePaymentHit,
  getOrganizationPayCommissionHistory,
};
