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
  console.log(othersData.role);

  if (othersData.role === ('ADMIN' || 'SUPER_ADMIN')) {
    const result = await prisma.user.create({
      data: {
        phone: phone,
        password: encryptedPassword,
        role: othersData.role,
        name: othersData.name,
      },
    });

    return result;
  } else {
    console.log(othersData.role);

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
    console.log(isBusinessTypeExist, othersData.businessTypeId);

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
