"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpGenerator = exports.randomString = void 0;
const randomString = () => {
    return Math.random().toString(36).substring(2, 15);
};
exports.randomString = randomString;
const otpGenerator = () => {
    let otp = '';
    for (let i = 0; i < 5; i++) {
        otp += Math.floor(Math.random() * 10);
    }
    return otp;
};
exports.otpGenerator = otpGenerator;
