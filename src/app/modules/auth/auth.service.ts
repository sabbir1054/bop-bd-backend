import { User } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { checkPasswordStrength } from '../../../helpers/checkPasswordStrength';
import { checkPhoneNumberFormate } from '../../../helpers/checkPhoneNumber';
import { encryptPassword } from '../../../helpers/encription';
import prisma from '../../../shared/prisma';

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
    data: { phone: phone, password: encryptedPassword, role: othersData.role },
  });

  return result;
};

export const AuthServices = {
  userRegistration,
};
