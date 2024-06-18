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
import prisma from '../../../shared/prisma';
import {
  ILoginInfo,
  ILoginResponse,
  IRefreshTokenResponse,
} from './auth.interface';

const userRegistration = async (payload: User): Promise<User> => {
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

  const result = await prisma.user.create({
    data: {
      phone: phone,
      password: encryptedPassword,
      role: othersData.role,
      name: othersData.name,
    },
  });

  return result;
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
