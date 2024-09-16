import { User } from '@prisma/client';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { checkPasswordStrength } from '../../../helpers/checkPasswordStrength';
import { checkPhoneNumberFormate } from '../../../helpers/checkPhoneNumber';
import {
  encryptPassword,
  isPasswordMatched,
} from '../../../helpers/encription';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import { generateOTP, sendOTP } from '../../../helpers/otpHelpers';
import { isCodeValid } from '../../../helpers/referCodeValidity';
import prisma from '../../../shared/prisma';
import {
  ILoginInfo,
  ILoginResponse,
  IRefreshTokenResponse,
  IRegisterInfo,
  IVerifyOtp,
} from './auth.interface';

const userRegistration = async (
  payload: IRegisterInfo,
): Promise<Partial<User>> => {
  const { password, phone, ...othersData } = payload;
  // check phone number validity
  const isPhoneValid = checkPhoneNumberFormate(phone);
  if (!isPhoneValid) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Please provide valid phone number',
    );
  }
  // password validity check
  const passwordValidity = checkPasswordStrength(password, phone);

  if (!passwordValidity.validity) {
    throw new ApiError(httpStatus.BAD_REQUEST, passwordValidity.msg);
  }

  // check is phone is already exist
  const isUserAlreadyExist = await prisma.user.findUnique({
    where: { phone: phone },
  });
  if (isUserAlreadyExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'User already registered with this phone number !',
    );
  }

  const encryptedPassword = await encryptPassword(password);

  const result = await prisma.$transaction(async prisma => {
    //otp process
    const otp = generateOTP();

    const sendOtp = await sendOTP(
      payload.phone,
      otp,
      `Your BOP-BD registration verification code is ${otp}`,
    );

    if (sendOtp == null || sendOtp.Status != 0) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Otp not send please try again',
      );
    }

    const makeOtpForUser = await prisma.oneTimePassword.create({
      data: {
        phone: payload.phone,
        otpCode: otp,
        checkCounter: 0,
        resendCounter: 0,
      },
    });

    if (!makeOtpForUser) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Otp not set');
    }

    if (othersData.role === 'ADMIN' || othersData.role === 'SUPER_ADMIN') {
      const result = await prisma.user.create({
        data: {
          phone: phone,
          password: encryptedPassword,
          role: othersData.role,
          name: othersData.name,
          verified: true,
        },
        select: {
          id: true,
          role: true,
          verified: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          photo: true,
          license: true,
          nid: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return result;
    } else {
      if (othersData.role === 'STAFF') {
        if (!othersData.organizationId) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            'For Staff registration , organization id is requied',
          );
        }

        //! verified that is organized exist or is owner verified => if not than throw error
        const isOrganizationExist = await prisma.organization.findUnique({
          where: { id: othersData.organizationId },
          include: {
            owner: true,
          },
        });

        if (!isOrganizationExist) {
          throw new ApiError(httpStatus.NOT_FOUND, 'Organization id not found');
        }

        if (!isOrganizationExist.owner.verified) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Organization owner not verified',
          );
        }

        if (!othersData.staffRole) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            'For Staff registration , staff role is requied',
          );
        }

        if (
          othersData.staffRole === 'DELIVERY_BOY' &&
          !othersData.deliveryArea
        ) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Give delivery boy area information',
          );
        }
        const result = await prisma.user.create({
          data: {
            phone: phone,
            password: encryptedPassword,
            role: othersData.role,
            name: othersData.name,
            verified: true,
          },
          select: {
            id: true,
            role: true,
            verified: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            photo: true,
            license: true,
            nid: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (othersData.staffRole === 'DELIVERY_BOY') {
          await prisma.staff.create({
            data: {
              organization: { connect: { id: othersData.organizationId } },
              role: othersData.staffRole,
              deliveryArea: othersData.deliveryArea,
              staffInfo: { connect: { id: result.id } },
            },
          });
        } else {
          await prisma.staff.create({
            data: {
              organization: { connect: { id: othersData.organizationId } },
              role: othersData.staffRole,
              staffInfo: { connect: { id: result.id } },
            },
          });
        }

        return result;
      } else {
        if (!othersData.businessTypeId) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Please provide your businessTypeId',
          );
        }
        //* business type check
        const isBusinessTypeExist = await prisma.businessType.findUnique({
          where: { id: othersData.businessTypeId },
        });

        if (!isBusinessTypeExist) {
          throw new ApiError(httpStatus.NOT_FOUND, 'Business type not found');
        }

        //* refercode checking

        const createdUser = await prisma.user.create({
          data: {
            phone: phone,
            password: encryptedPassword,
            role: othersData.role,
            name: othersData.name,
          },
          select: {
            id: true,
            role: true,
            verified: true,
            isMobileVerified: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            photo: true,
            license: true,
            nid: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        const createdOrganization = await prisma.organization.create({
          data: {
            ownerId: createdUser.id,
            businessTypeId: othersData?.businessTypeId,
          },
        });

        if (payload.refferCode) {
          const codeInfo = await prisma.refferedCode.findUnique({
            where: { code: payload.refferCode },
            include: {
              codeOwnerOrganization: true,
            },
          });

          if (!codeInfo) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Referral code not found');
          }
          const isValid = isCodeValid(new Date(codeInfo.validUntil));

          if (!isValid || !codeInfo?.isValid) {
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              'Referral code has expired',
            );
          }
          //* use reffer code
          const usedReferredCode = await prisma.usedReffereCode.create({
            data: {
              refferedCodeId: codeInfo.id,
              organizationId: createdOrganization.id,
            },
            include: {
              refferCode: {
                include: {
                  joiningRewardPoints: true,
                },
              },
            },
          });
          //* add reward to organization and make history
          const rewardHistory =
            await prisma.organizationRewardPointsHistory.create({
              data: {
                pointHistoryType: 'IN',
                rewardPointsId:
                  usedReferredCode.refferCode.joiningRewardPoints.id,
                points: usedReferredCode.refferCode.joiningRewardPoints.points,
                organizationId: createdOrganization.id,
              },
            });

          //* add to organizationPoints
          const updateOrganizationPoints = await prisma.organization.update({
            where: { id: createdOrganization.id },
            data: {
              totalRewardPoints:
                usedReferredCode.refferCode.joiningRewardPoints.points,
            },
          });

          //* now also get reward who owned the reffer code
          const addOwneRewardHistory =
            await prisma.organizationRewardPointsHistory.create({
              data: {
                pointHistoryType: 'IN',
                rewardPointsId:
                  usedReferredCode.refferCode.joiningRewardPoints.id,
                points: usedReferredCode.refferCode.joiningRewardPoints.points,
                organizationId: codeInfo.codeOwnerOrganization.id,
              },
            });

          const updateCodeOwnerPoints = await prisma.organization.update({
            where: { id: codeInfo.codeOwnerOrganization.id },
            data: {
              totalRewardPoints: {
                increment:
                  usedReferredCode.refferCode.joiningRewardPoints.points,
              },
            },
          });
        }

        const result = await prisma.user.update({
          where: { id: createdUser.id },
          data: { organizationId: createdOrganization.id },
        });
        return result;
      }
    }
  });

  return result;
};

const verifyOTP = async (payload: IVerifyOtp) => {
  const isUserCreate = await prisma.user.findUnique({
    where: { phone: payload.phone },
  });

  if (!isUserCreate) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'User inf not save please register again',
    );
  }

  const isPhoneOtpExist = await prisma.oneTimePassword.findUnique({
    where: { phone: payload.phone },
  });
  if (!isPhoneOtpExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Phone info not found');
  }

  const result = await prisma.$transaction(async prisma => {
    if (isPhoneOtpExist.otpCode === payload.givenOtp) {
      // OTP matched
      const result = await prisma.user.update({
        where: { phone: payload.phone },
        data: { isMobileVerified: true },
        select: {
          id: true,
          role: true,
          verified: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          photo: true,
          license: true,
          nid: true,
          createdAt: true,
          updatedAt: true,
          isMobileVerified: true,
        },
      });
      await prisma.oneTimePassword.delete({ where: { phone: payload.phone } });
      const newResult = {
        message: 'Phone verified',
        result: result,
      };

      return newResult;
    } else {
      if (isPhoneOtpExist.resendCounter <= 2) {
        if (isPhoneOtpExist.checkCounter < 2) {
          const result = await prisma.oneTimePassword.update({
            where: { phone: payload.phone },
            data: { checkCounter: { increment: 1 } },
          });
          const newResult = {
            message: 'Invalid OTP. Please try again.',
            result: result,
          };

          return newResult;
        } else if (isPhoneOtpExist.checkCounter === 2) {
          const result = await prisma.oneTimePassword.update({
            where: { phone: payload.phone },
            data: { checkCounter: { increment: 1 } },
          });
          const newResult = {
            message: 'Otp expired , Resend it.',
            result: result,
          };

          return newResult;
        } else {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Otp expired, Resend it');
        }
      } else {
        if (isPhoneOtpExist.checkCounter <= 2) {
          const result = await prisma.oneTimePassword.update({
            where: { phone: payload.phone },
            data: { checkCounter: { increment: 1 } },
          });
          const newResult = {
            message: 'Invalid OTP. Please try again.',
            result: result,
          };

          return newResult;
        } else {
          // Delete user after 3 resends and 3 check attempts
          await prisma.user.delete({ where: { id: isUserCreate.id } });
          await prisma.oneTimePassword.delete({
            where: { phone: payload.phone },
          });

          const result = {
            message: 'Limit exceed. Please try again after some time.',
            result: 'Again register user',
          };

          return result;
        }
      }
    }
  });
  return result;
};

const resendOtp = async (phone: string) => {
  const isUserCreate = await prisma.user.findUnique({
    where: { phone: phone },
  });

  if (!isUserCreate) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'User register info not save please register again',
    );
  }

  const isPhoneOtpExist = await prisma.oneTimePassword.findUnique({
    where: { phone: phone },
  });
  if (!isPhoneOtpExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Phone info not found');
  }

  if (isPhoneOtpExist.resendCounter < 3) {
    //otp process
    const otp = generateOTP();

    const sendOtp = await sendOTP(
      phone,
      otp,
      `Your BOP-BD registration verification code is ${otp}`,
    );

    if (sendOtp == null || sendOtp.Status != 0) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Otp not send please try again',
      );
    }

    const makeOtpForUser = await prisma.oneTimePassword.update({
      where: { phone: phone },
      data: {
        otpCode: otp,
        checkCounter: 0,
        resendCounter: { increment: 1 },
      },
    });

    if (!makeOtpForUser) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Otp not set');
    }
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Your limit exceed');
  }
};

const userLogin = async (payload: ILoginInfo): Promise<ILoginResponse> => {
  const { phone, password } = payload;

  // check phone number validity
  const isPhoneValid = checkPhoneNumberFormate(phone);
  if (!isPhoneValid) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Please provide valid phone number',
    );
  }
  // is user exist
  const isUserExist = await prisma.user.findUnique({
    where: { phone: phone },
  });
  if (!isUserExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not exist !');
  }

  // check password
  if (
    isUserExist.password &&
    !(await isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is not matched');
  }

  const { id, role } = isUserExist;
  const accessToken = jwtHelpers.createToken(
    { id, role, phone },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string,
  );

  const refreshToken = jwtHelpers.createToken(
    { id, role, phone },
    config.jwt.refresh_secret as Secret,
    payload.isRemember ? '30d' : (config.jwt.refresh_expires_in as string),
  );

  return { accessToken, refreshToken };
};

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  let verifiedToken = null;

  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret,
    );
  } catch (error) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid Refresh Token');
  }

  const { id } = verifiedToken;
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }
  // generate user access token
  const newAccessToken = jwtHelpers.createToken(
    { id: isUserExist.id, role: isUserExist.role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string,
  );

  return {
    accessToken: newAccessToken,
  };
};

const forgetPasswordOtp = async (phone: string) => {
  const isUserExist = await prisma.user.findUnique({ where: { phone: phone } });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User info not exist');
  }
  const otp = generateOTP();
  const sendOtp = await sendOTP(
    phone,
    otp,
    `From BOP-BD, password reset verification code is ${otp}`,
  );

  if (sendOtp == null || sendOtp.Status != 0) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Otp not send please try again',
    );
  }

  const makeOtpForUser = await prisma.oneTimePassword.create({
    data: {
      phone: phone,
      otpCode: otp,
      checkCounter: 0,
      resendCounter: 0,
    },
  });

  if (!makeOtpForUser) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Otp not set');
  }

  return makeOtpForUser;
};

const resendForgetpasswordOtp = async (phone: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: { phone: phone },
  });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User info not exist');
  }

  const isOtpExist = await prisma.oneTimePassword.findUnique({
    where: { phone: phone },
  });
  const otp = generateOTP();

  const sendOtp = await sendOTP(
    phone,
    otp,
    `From BOP-BD, password reset verification code is ${otp}`,
  );

  if (sendOtp == null || sendOtp.Status != 0) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Otp not send please try again',
    );
  }

  if (isOtpExist) {
    if (isOtpExist?.resendCounter >= 3) {
      await prisma.oneTimePassword.delete({ where: { phone: phone } });
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'You exceed the limit, please try again after some time',
      );
    }
    const makeOtpForUser = await prisma.oneTimePassword.update({
      where: { phone: phone },
      data: {
        phone: phone,
        otpCode: otp,
        checkCounter: 0,
        resendCounter: { increment: 1 },
      },
    });

    if (!makeOtpForUser) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Otp not set');
    }

    return makeOtpForUser;
  } else {
    const makeOtpForUser = await prisma.oneTimePassword.create({
      data: {
        phone: phone,
        otpCode: otp,
        checkCounter: 0,
        resendCounter: 0,
      },
    });

    if (!makeOtpForUser) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Otp not set');
    }

    return makeOtpForUser;
  }
};

const verifyForgotPasswordOtp = async (phone: string, otp: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: { phone: phone },
  });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User info not exist');
  }
  const isOtpExist = await prisma.oneTimePassword.findUnique({
    where: { phone: phone },
  });
  if (!isOtpExist) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Otp info not exist, please resend it.',
    );
  }

  if (isOtpExist.otpCode !== otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Otp not matched');
  } else {
    const result = await prisma.oneTimePassword.delete({
      where: { phone: phone },
    });
    return 'Otp matched';
  }
};

const updatePassword = async (newPassword: string, phone: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: { phone: phone },
  });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User info not exist');
  }
  // password validity check
  const passwordValidity = checkPasswordStrength(newPassword, phone);

  if (!passwordValidity.validity) {
    throw new ApiError(httpStatus.BAD_REQUEST, passwordValidity.msg);
  }

  const encryptNewPass = await encryptPassword(newPassword);
  const result = await prisma.user.update({
    where: { phone: phone },
    data: { password: encryptNewPass },
  });

  return result;
};

export const AuthServices = {
  userRegistration,
  userLogin,
  refreshToken,
  verifyOTP,
  resendOtp,
  forgetPasswordOtp,
  resendForgetpasswordOtp,
  verifyForgotPasswordOtp,
  updatePassword,
};
