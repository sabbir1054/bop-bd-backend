import axios from 'axios';
import config from '../config';

export const chackSmsBalance = async () => {
  const balanceCheckLink = config.mobileOTP.smsBalance;
  const response = await axios.get(`${balanceCheckLink}`);
  return response;
};
