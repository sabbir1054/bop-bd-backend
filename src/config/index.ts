/* eslint-disable no-undef */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  sAdminPassKey: process.env.SUPER_ADMIN_PASSKEY,
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bycrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  base_url_frontend: process.env.BASE_URL_FRONTEND,
  email_host: {
    name: process.env.EMAIL_HOST_NAME,
    port: process.env.EMAIL_HOST_PORT,
    user: process.env.EMAIL_HOST_USER,
    password: process.env.EMAIL_HOST_PASSWORD,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    expires_in: process.env.JWT_EXPIRES_IN,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  mobileOTP: {
    apiKey: process.env.MOBILE_OTP_API_KEY,
    secretKey: process.env.MOBILE_OTP_SECRET_KEY,
    callerId: process.env.MOBILE_OTP_CALLER_ID,
  },
};
