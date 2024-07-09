"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-undef */
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
exports.default = {
    sAdminPassKey: process.env.SUPER_ADMIN_PASSKEY,
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    bycrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
    base_url_frontend: process.env.BASE_URL_FRONTEND,
    api_link_Image: process.env.API_LINK_OF_IMAGE,
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
