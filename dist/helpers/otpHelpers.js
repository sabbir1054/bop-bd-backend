"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTP = exports.generateOTP = void 0;
const axios_1 = __importDefault(require("axios"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../config"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const generateOTP = () => {
    const length = 6;
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        otp += digits[randomIndex];
    }
    return otp;
};
exports.generateOTP = generateOTP;
const sendOTP = (phone, otp, message) => __awaiter(void 0, void 0, void 0, function* () {
    const apiKey = config_1.default.mobileOTP.apiKey;
    const secretKey = config_1.default.mobileOTP.secretKey;
    const callerID = config_1.default.mobileOTP.callerId;
    const url = `http://api.quicksms.xyz/sendtext?apikey=${apiKey}&secretkey=${secretKey}&callerID=${callerID}&toUser=${phone}&messageContent=${message}`;
    let response = null;
    try {
        response = yield axios_1.default.get(url);
        response = response.data;
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to send OTP');
    }
    return response;
});
exports.sendOTP = sendOTP;
