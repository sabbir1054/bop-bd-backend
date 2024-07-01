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
import prisma from '../../../shared/prisma';
import {
  ILoginInfo,
  ILoginResponse,
  IRefreshTokenResponse,
  IVerifyOtp,
} from './auth.interface';

const userRegistration = async (payload: User): Promise<Partial<User>> => {
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

    if (othersData.role === ('ADMIN' || 'SUPER_ADMIN')) {
      const result = await prisma.user.create({
        data: {
          phone: phone,
          password: encryptedPassword,
          role: othersData.role,
          name: othersData.name,
        },
        select: {
          id: true,
          role: true,
          memberCategory: true,
          verified: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          photo: true,
          license: true,
          nid: true,
          shop_name: true,
          createdAt: true,
          updatedAt: true,
          feedbacks: true,
          cart: true,
          products: true,
          outgoing_order: true,
          incoming_order: true,
          businessType: true,
          businessTypeId: true,
        },
      });

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

      const result = await prisma.user.create({
        data: {
          phone: phone,
          password: encryptedPassword,
          role: othersData.role,
          name: othersData.name,
          businessType: { connect: { id: othersData.businessTypeId } },
        },
        select: {
          id: true,
          role: true,
          memberCategory: true,
          verified: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          photo: true,
          license: true,
          nid: true,
          shop_name: true,
          createdAt: true,
          updatedAt: true,
          feedbacks: true,
          cart: true,
          products: true,
          outgoing_order: true,
          incoming_order: true,
          businessType: true,
          businessTypeId: true,
        },
      });

      return result;
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
    // otp matched
    if (isPhoneOtpExist.otpCode == payload.givenOtp) {
      const result = await prisma.user.update({
        where: { phone: payload.phone },
        data: { isMobileVerified: true },
      });
      await prisma.oneTimePassword.delete({ where: { phone: payload.phone } });
    } else {
      //otp not matched

      // condition resend otp 3 & check otp 3
      if (
        isPhoneOtpExist.checkCounter === 3 &&
        isPhoneOtpExist.resendCounter === 3
      ) {
        await prisma.user.delete({ where: { id: isUserCreate.id } });
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'You exceed your resend and otp check limit please try again after some time',
        );
      }
      // condition resend otp 2||1 & check otp 3
      else if (
        (isPhoneOtpExist.checkCounter === 3 &&
          isPhoneOtpExist.resendCounter === 2) ||
        (isPhoneOtpExist.checkCounter === 3 &&
          isPhoneOtpExist.resendCounter === 1)
      ) {
        await prisma.oneTimePassword.update({
          where: { phone: payload.phone },
          data: { checkCounter: 0 },
        });
        throw new ApiError(httpStatus.BAD_REQUEST, 'Otp is expired, resend it');
      } else {
        await prisma.oneTimePassword.update({
          where: { phone: payload.phone },
          data: { checkCounter: { increment: 1 } },
        });
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Otp not matched,try agai with valid otp',
        );
      }
    }
  });
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
    config.jwt.refresh_expires_in as string,
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

export const AuthServices = {
  userRegistration,
  userLogin,
  refreshToken,
};
