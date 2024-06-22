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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../../config"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const checkPasswordStrength_1 = require("../../../helpers/checkPasswordStrength");
const checkPhoneNumber_1 = require("../../../helpers/checkPhoneNumber");
const encription_1 = require("../../../helpers/encription");
const jwtHelpers_1 = require("../../../helpers/jwtHelpers");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const userRegistration = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, phone } = payload, othersData = __rest(payload, ["password", "phone"]);
    // check phone number validity
    const isPhoneValid = (0, checkPhoneNumber_1.checkPhoneNumberFormate)(phone);
    if (!isPhoneValid) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Please provide valid phone number');
    }
    // password validity check
    const passwordValidity = (0, checkPasswordStrength_1.checkPasswordStrength)(password, phone);
    if (!passwordValidity.validity) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, passwordValidity.msg);
    }
    // check is phone is already exist
    const isUserAlreadyExist = yield prisma_1.default.user.findUnique({
        where: { phone: phone },
    });
    if (isUserAlreadyExist) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User already registered with this phone number !');
    }
    const encryptedPassword = yield (0, encription_1.encryptPassword)(password);
    console.log(othersData.role);
    if (othersData.role === ('ADMIN' || 'SUPER_ADMIN')) {
        const result = yield prisma_1.default.user.create({
            data: {
                phone: phone,
                password: encryptedPassword,
                role: othersData.role,
                name: othersData.name,
            },
        });
        return result;
    }
    else {
        console.log(othersData.role);
        if (!othersData.businessTypeId) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Please provide your businessTypeId');
        }
        //* business type check
        const isBusinessTypeExist = yield prisma_1.default.businessType.findUnique({
            where: { id: othersData.businessTypeId },
        });
        console.log(isBusinessTypeExist, othersData.businessTypeId);
        if (!isBusinessTypeExist) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Business type not found');
        }
        const result = yield prisma_1.default.user.create({
            data: {
                phone: phone,
                password: encryptedPassword,
                role: othersData.role,
                name: othersData.name,
                businessType: { connect: { id: othersData.businessTypeId } },
            },
        });
        return result;
    }
});
const userLogin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, password } = payload;
    // check phone number validity
    const isPhoneValid = (0, checkPhoneNumber_1.checkPhoneNumberFormate)(phone);
    if (!isPhoneValid) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Please provide valid phone number');
    }
    // is user exist
    const isUserExist = yield prisma_1.default.user.findUnique({
        where: { phone: phone },
    });
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User not exist !');
    }
    // check password
    if (isUserExist.password &&
        !(yield (0, encription_1.isPasswordMatched)(password, isUserExist.password))) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Password is not matched');
    }
    const { id, role } = isUserExist;
    const accessToken = jwtHelpers_1.jwtHelpers.createToken({ id, role, phone }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
    const refreshToken = jwtHelpers_1.jwtHelpers.createToken({ id, role, phone }, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
    return { accessToken, refreshToken };
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    let verifiedToken = null;
    try {
        verifiedToken = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.refresh_secret);
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Invalid Refresh Token');
    }
    const { id } = verifiedToken;
    const isUserExist = yield prisma_1.default.user.findUnique({
        where: {
            id: id,
        },
    });
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User does not exist');
    }
    // generate user access token
    const newAccessToken = jwtHelpers_1.jwtHelpers.createToken({ id: isUserExist.id, role: isUserExist.role }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
    return {
        accessToken: newAccessToken,
    };
});
exports.AuthServices = {
    userRegistration,
    userLogin,
    refreshToken,
};
