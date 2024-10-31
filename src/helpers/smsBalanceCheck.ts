import axios from 'axios';
import httpStatus from 'http-status';
import config from '../config';
import ApiError from '../errors/ApiError';

export const chackSmsBalance = async () => {
  const balanceCheckLink = config.mobileOTP.smsBalance;
  try {
    if (balanceCheckLink) {
      const response = await axios.get(balanceCheckLink);

      // Return only the data part of the response
      return response.data;
    }
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Error checking SMS balance:');
  }
};
