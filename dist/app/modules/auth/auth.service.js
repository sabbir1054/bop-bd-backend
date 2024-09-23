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
const otpHelpers_1 = require("../../../helpers/otpHelpers");
const referCodeValidity_1 = require("../../../helpers/referCodeValidity");
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
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        //otp process
        const otp = (0, otpHelpers_1.generateOTP)();
        const sendOtp = yield (0, otpHelpers_1.sendOTP)(payload.phone, otp, `Your BOP-BD registration verification code is ${otp}`);
        if (sendOtp == null || sendOtp.Status != 0) {
            throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Otp not send please try again');
        }
        const makeOtpForUser = yield prisma.oneTimePassword.create({
            data: {
                phone: payload.phone,
                otpCode: otp,
                checkCounter: 0,
                resendCounter: 0,
            },
        });
        if (!makeOtpForUser) {
            throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Otp not set');
        }
        if (othersData.role === 'ADMIN' || othersData.role === 'SUPER_ADMIN') {
            const result = yield prisma.user.create({
                data: {
                    phone: phone,
                    password: encryptedPassword,
                    role: othersData.role,
                    name: othersData.name,
                    verified: true,
                },
                select: {
                    id: true,
                    role: true,
                    verified: true,
                    name: true,
                    email: true,
                    phone: true,
                    address: true,
                    photo: true,
                    license: true,
                    nid: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            return result;
        }
        else {
            if (othersData.role === 'STAFF') {
                if (!othersData.organizationId) {
                    throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'For Staff registration , organization id is requied');
                }
                //! verified that is organized exist or is owner verified => if not than throw error
                const isOrganizationExist = yield prisma.organization.findUnique({
                    where: { id: othersData.organizationId },
                    include: {
                        owner: true,
                    },
                });
                if (!isOrganizationExist) {
                    throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization id not found');
                }
                if (!isOrganizationExist.owner.verified) {
                    throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Organization owner not verified');
                }
                if (!othersData.staffRole) {
                    throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'For Staff registration , staff role is requied');
                }
                if (othersData.staffRole === 'DELIVERY_BOY' &&
                    !othersData.deliveryArea) {
                    throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Give delivery boy area information');
                }
                const result = yield prisma.user.create({
                    data: {
                        phone: phone,
                        password: encryptedPassword,
                        role: othersData.role,
                        name: othersData.name,
                        verified: true,
                    },
                    select: {
                        id: true,
                        role: true,
                        verified: true,
                        name: true,
                        email: true,
                        phone: true,
                        address: true,
                        photo: true,
                        license: true,
                        nid: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                });
                if (othersData.staffRole === 'DELIVERY_BOY') {
                    yield prisma.staff.create({
                        data: {
                            organization: { connect: { id: othersData.organizationId } },
                            role: othersData.staffRole,
                            deliveryArea: othersData.deliveryArea,
                            staffInfo: { connect: { id: result.id } },
                        },
                    });
                }
                else {
                    yield prisma.staff.create({
                        data: {
                            organization: { connect: { id: othersData.organizationId } },
                            role: othersData.staffRole,
                            staffInfo: { connect: { id: result.id } },
                        },
                    });
                }
                return result;
            }
            else {
                if (!othersData.businessTypeId) {
                    throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Please provide your businessTypeId');
                }
                //* business type check
                const isBusinessTypeExist = yield prisma.businessType.findUnique({
                    where: { id: othersData.businessTypeId },
                });
                if (!isBusinessTypeExist) {
                    throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Business type not found');
                }
                //* refercode checking
                const createdUser = yield prisma.user.create({
                    data: {
                        phone: phone,
                        password: encryptedPassword,
                        role: othersData.role,
                        name: othersData.name,
                    },
                    select: {
                        id: true,
                        role: true,
                        verified: true,
                        isMobileVerified: true,
                        name: true,
                        email: true,
                        phone: true,
                        address: true,
                        photo: true,
                        license: true,
                        nid: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                });
                const createdOrganization = yield prisma.organization.create({
                    data: {
                        ownerId: createdUser.id,
                        businessTypeId: othersData === null || othersData === void 0 ? void 0 : othersData.businessTypeId,
                    },
                });
                if (payload.refferCode) {
                    const codeInfo = yield prisma.refferedCode.findUnique({
                        where: { code: payload.refferCode },
                        include: {
                            codeOwnerOrganization: true,
                        },
                    });
                    if (!codeInfo) {
                        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Referral code not found');
                    }
                    const isValid = (0, referCodeValidity_1.isCodeValid)(new Date(codeInfo.validUntil));
                    if (!isValid || !(codeInfo === null || codeInfo === void 0 ? void 0 : codeInfo.isValid)) {
                        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Referral code has expired');
                    }
                    //* use reffer code
                    const usedReferredCode = yield prisma.usedReffereCode.create({
                        data: {
                            refferedCodeId: codeInfo.id,
                            organizationId: createdOrganization.id,
                        },
                        include: {
                            refferCode: {
                                include: {
                                    joiningRewardPoints: true,
                                },
                            },
                        },
                    });
                    //* add reward to organization and make history
                    const rewardHistory = yield prisma.organizationRewardPointsHistory.create({
                        data: {
                            pointHistoryType: 'IN',
                            rewardPointsId: usedReferredCode.refferCode.joiningRewardPoints.id,
                            points: usedReferredCode.refferCode.joiningRewardPoints.points,
                            organizationId: createdOrganization.id,
                        },
                    });
                    //* add to organizationPoints
                    const updateOrganizationPoints = yield prisma.organization.update({
                        where: { id: createdOrganization.id },
                        data: {
                            totalRewardPoints: usedReferredCode.refferCode.joiningRewardPoints.points,
                        },
                    });
                    //* now also get reward who owned the reffer code
                    const addOwneRewardHistory = yield prisma.organizationRewardPointsHistory.create({
                        data: {
                            pointHistoryType: 'IN',
                            rewardPointsId: usedReferredCode.refferCode.joiningRewardPoints.id,
                            points: usedReferredCode.refferCode.joiningRewardPoints.points,
                            organizationId: codeInfo.codeOwnerOrganization.id,
                        },
                    });
                    const updateCodeOwnerPoints = yield prisma.organization.update({
                        where: { id: codeInfo.codeOwnerOrganization.id },
                        data: {
                            totalRewardPoints: {
                                increment: usedReferredCode.refferCode.joiningRewardPoints.points,
                            },
                        },
                    });
                }
                const result = yield prisma.user.update({
                    where: { id: createdUser.id },
                    data: { organizationId: createdOrganization.id },
                });
                return result;
            }
        }
    }));
    return result;
});
const verifyOTP = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserCreate = yield prisma_1.default.user.findUnique({
        where: { phone: payload.phone },
    });
    if (!isUserCreate) {
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'User inf not save please register again');
    }
    const isPhoneOtpExist = yield prisma_1.default.oneTimePassword.findUnique({
        where: { phone: payload.phone },
    });
    if (!isPhoneOtpExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Phone info not found');
    }
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        if (isPhoneOtpExist.otpCode === payload.givenOtp) {
            // OTP matched
            const result = yield prisma.user.update({
                where: { phone: payload.phone },
                data: { isMobileVerified: true },
                select: {
                    id: true,
                    role: true,
                    verified: true,
                    name: true,
                    email: true,
                    phone: true,
                    address: true,
                    photo: true,
                    license: true,
                    nid: true,
                    createdAt: true,
                    updatedAt: true,
                    isMobileVerified: true,
                },
            });
            yield prisma.oneTimePassword.delete({ where: { phone: payload.phone } });
            const newResult = {
                message: 'Phone verified',
                result: result,
            };
            return newResult;
        }
        else {
            if (isPhoneOtpExist.resendCounter <= 2) {
                if (isPhoneOtpExist.checkCounter < 2) {
                    const result = yield prisma.oneTimePassword.update({
                        where: { phone: payload.phone },
                        data: { checkCounter: { increment: 1 } },
                    });
                    const newResult = {
                        message: 'Invalid OTP. Please try again.',
                        result: result,
                    };
                    return newResult;
                }
                else if (isPhoneOtpExist.checkCounter === 2) {
                    const result = yield prisma.oneTimePassword.update({
                        where: { phone: payload.phone },
                        data: { checkCounter: { increment: 1 } },
                    });
                    const newResult = {
                        message: 'Otp expired , Resend it.',
                        result: result,
                    };
                    return newResult;
                }
                else {
                    throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Otp expired, Resend it');
                }
            }
            else {
                if (isPhoneOtpExist.checkCounter <= 2) {
                    const result = yield prisma.oneTimePassword.update({
                        where: { phone: payload.phone },
                        data: { checkCounter: { increment: 1 } },
                    });
                    const newResult = {
                        message: 'Invalid OTP. Please try again.',
                        result: result,
                    };
                    return newResult;
                }
                else {
                    // Delete user after 3 resends and 3 check attempts
                    yield prisma.user.delete({ where: { id: isUserCreate.id } });
                    yield prisma.oneTimePassword.delete({
                        where: { phone: payload.phone },
                    });
                    const result = {
                        message: 'Limit exceed. Please try again after some time.',
                        result: 'Again register user',
                    };
                    return result;
                }
            }
        }
    }));
    return result;
});
const resendOtp = (phone) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserCreate = yield prisma_1.default.user.findUnique({
        where: { phone: phone },
    });
    if (!isUserCreate) {
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'User register info not save please register again');
    }
    const isPhoneOtpExist = yield prisma_1.default.oneTimePassword.findUnique({
        where: { phone: phone },
    });
    if (!isPhoneOtpExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Phone info not found');
    }
    if (isPhoneOtpExist.resendCounter < 3) {
        //otp process
        const otp = (0, otpHelpers_1.generateOTP)();
        const sendOtp = yield (0, otpHelpers_1.sendOTP)(phone, otp, `Your BOP-BD registration verification code is ${otp}`);
        if (sendOtp == null || sendOtp.Status != 0) {
            throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Otp not send please try again');
        }
        const makeOtpForUser = yield prisma_1.default.oneTimePassword.update({
            where: { phone: phone },
            data: {
                otpCode: otp,
                checkCounter: 0,
                resendCounter: { increment: 1 },
            },
        });
        if (!makeOtpForUser) {
            throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Otp not set');
        }
    }
    else {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Your limit exceed');
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
    const refreshToken = jwtHelpers_1.jwtHelpers.createToken({ id, role, phone }, config_1.default.jwt.refresh_secret, payload.isRemember ? '30d' : config_1.default.jwt.refresh_expires_in);
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
const forgetPasswordOtp = (phone) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield prisma_1.default.user.findUnique({ where: { phone: phone } });
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User info not exist');
    }
    const otp = (0, otpHelpers_1.generateOTP)();
    const sendOtp = yield (0, otpHelpers_1.sendOTP)(phone, otp, `From BOP-BD, password reset verification code is ${otp}`);
    if (sendOtp == null || sendOtp.Status != 0) {
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Otp not send please try again');
    }
    const makeOtpForUser = yield prisma_1.default.oneTimePassword.create({
        data: {
            phone: phone,
            otpCode: otp,
            checkCounter: 0,
            resendCounter: 0,
        },
    });
    if (!makeOtpForUser) {
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Otp not set');
    }
    return makeOtpForUser;
});
const resendForgetpasswordOtp = (phone) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield prisma_1.default.user.findUnique({
        where: { phone: phone },
    });
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User info not exist');
    }
    const isOtpExist = yield prisma_1.default.oneTimePassword.findUnique({
        where: { phone: phone },
    });
    const otp = (0, otpHelpers_1.generateOTP)();
    const sendOtp = yield (0, otpHelpers_1.sendOTP)(phone, otp, `From BOP-BD, password reset verification code is ${otp}`);
    if (sendOtp == null || sendOtp.Status != 0) {
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Otp not send please try again');
    }
    if (isOtpExist) {
        if ((isOtpExist === null || isOtpExist === void 0 ? void 0 : isOtpExist.resendCounter) >= 3) {
            yield prisma_1.default.oneTimePassword.delete({ where: { phone: phone } });
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You exceed the limit, please try again after some time');
        }
        const makeOtpForUser = yield prisma_1.default.oneTimePassword.update({
            where: { phone: phone },
            data: {
                phone: phone,
                otpCode: otp,
                checkCounter: 0,
                resendCounter: { increment: 1 },
            },
        });
        if (!makeOtpForUser) {
            throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Otp not set');
        }
        return makeOtpForUser;
    }
    else {
        const makeOtpForUser = yield prisma_1.default.oneTimePassword.create({
            data: {
                phone: phone,
                otpCode: otp,
                checkCounter: 0,
                resendCounter: 0,
            },
        });
        if (!makeOtpForUser) {
            throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Otp not set');
        }
        return makeOtpForUser;
    }
});
const verifyForgotPasswordOtp = (phone, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield prisma_1.default.user.findUnique({
        where: { phone: phone },
    });
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User info not exist');
    }
    const isOtpExist = yield prisma_1.default.oneTimePassword.findUnique({
        where: { phone: phone },
    });
    if (!isOtpExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Otp info not exist, please resend it.');
    }
    if (isOtpExist.otpCode !== otp) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Otp not matched');
    }
    else {
        const result = yield prisma_1.default.oneTimePassword.delete({
            where: { phone: phone },
        });
        return 'Otp matched';
    }
});
const updatePassword = (newPassword, phone) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield prisma_1.default.user.findUnique({
        where: { phone: phone },
    });
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User info not exist');
    }
    // password validity check
    const passwordValidity = (0, checkPasswordStrength_1.checkPasswordStrength)(newPassword, phone);
    if (!passwordValidity.validity) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, passwordValidity.msg);
    }
    const encryptNewPass = yield (0, encription_1.encryptPassword)(newPassword);
    const result = yield prisma_1.default.user.update({
        where: { phone: phone },
        data: { password: encryptNewPass },
    });
    return result;
});
exports.AuthServices = {
    userRegistration,
    userLogin,
    refreshToken,
    verifyOTP,
    resendOtp,
    forgetPasswordOtp,
    resendForgetpasswordOtp,
    verifyForgotPasswordOtp,
    updatePassword,
};
