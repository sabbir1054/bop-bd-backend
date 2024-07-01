import axios from 'axios';
import httpStatus from 'http-status';
import config from '../config';
import ApiError from '../errors/ApiError';

export const generateOTP = (): string => {
  const length = 6;
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    otp += digits[randomIndex];
  }
  return otp;
};

export const sendOTP = async (phone: string, otp: string, message: String) => {
  const apiKey = config.mobileOTP.apiKey;
  const secretKey = config.mobileOTP.secretKey;
  const callerID = config.mobileOTP.callerId;

  const url = `http://api.quicksms.xyz/sendtext?apikey=${apiKey}&secretkey=${secretKey}&callerID=${callerID}&toUser=${phone}&messageContent=${message}`;
  let response = null;
  try {
    response = await axios.get(url);
    response = response.data;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send OTP');
  }

  return response;
};
