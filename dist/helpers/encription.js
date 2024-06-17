"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPasswordMatched = exports.encryptPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../config"));
const encryptPassword = (password) => {
    const result = bcrypt_1.default.hash(password, Number(config_1.default.bycrypt_salt_rounds));
    return result;
};
exports.encryptPassword = encryptPassword;
const isPasswordMatched = (givenPassword, savedPassword) => {
    const result = bcrypt_1.default.compare(givenPassword, savedPassword);
    return result;
};
exports.isPasswordMatched = isPasswordMatched;
