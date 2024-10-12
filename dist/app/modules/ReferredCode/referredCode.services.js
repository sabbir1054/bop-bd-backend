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
exports.ReferredCodeService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const referredCodeGenaretor_1 = require("../../../helpers/referredCodeGenaretor");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const createNew = (userid, role, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (role === 'STAFF') {
        const validStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userid },
        });
        if (!validStaff ||
            validStaff.role !== 'STAFF_ADMIN' ||
            !validStaff.isValidNow) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid staff role');
        }
        const organizationInfo = yield prisma_1.default.organization.findUnique({
            where: { id: validStaff.organizationId },
            include: {
                owner: true,
                ownerRefferedCode: true,
            },
        });
        if (!((_a = organizationInfo === null || organizationInfo === void 0 ? void 0 : organizationInfo.owner) === null || _a === void 0 ? void 0 : _a.verified)) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Your organization is not verified');
        }
    }
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c;
        const organizationInfo = yield prisma.user.findUnique({
            where: { id: userid },
            include: {
                organization: {
                    include: {
                        owner: true,
                        ownerRefferedCode: true,
                    },
                },
            },
        });
        if (!((_c = (_b = organizationInfo === null || organizationInfo === void 0 ? void 0 : organizationInfo.organization) === null || _b === void 0 ? void 0 : _b.owner) === null || _c === void 0 ? void 0 : _c.verified)) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Your organization is not verified');
        }
        if (organizationInfo.organization.ownerRefferedCode.filter(code => code.isValid === true).length > 0) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You have already an active refer code');
        }
        let referCode = (0, referredCodeGenaretor_1.generateReferralCode)();
        const isExist = yield prisma.refferedCode.findUnique({
            where: { code: referCode },
        });
        if (isExist) {
            referCode = (0, referredCodeGenaretor_1.generateReferralCode)();
        }
        else {
            const joiningRewardInfo = yield prisma.rewardPoints.findFirst({
                where: {
                    AND: [
                        {
                            membershipCategory: organizationInfo.organization.memberShipCategory,
                        },
                        {
                            rewardType: 'JOINING',
                        },
                    ],
                },
            });
            if (!joiningRewardInfo) {
                throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Joining Reward info not found');
            }
            const buyingRewardInfo = yield prisma.rewardPoints.findFirst({
                where: {
                    AND: [
                        {
                            membershipCategory: organizationInfo.organization.memberShipCategory,
                        },
                        {
                            rewardType: 'BUYING',
                        },
                    ],
                },
            });
            if (!buyingRewardInfo) {
                throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Buying Reward info not found');
            }
            const sellingRewardInfo = yield prisma.rewardPoints.findFirst({
                where: {
                    AND: [
                        {
                            membershipCategory: organizationInfo.organization.memberShipCategory,
                        },
                        {
                            rewardType: 'SELLING',
                        },
                    ],
                },
            });
            if (!sellingRewardInfo) {
                throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Buying Reward info not found');
            }
            //* get the validity day
            const validityDay = yield prisma.validityDays.findFirst();
            if (!validityDay) {
                throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Validity day info not found');
            }
            const commission = yield prisma.commission.findFirst({
                where: {
                    AND: [
                        { commissionType: 'REFERRED_MEMBER' },
                        {
                            membershipCategory: organizationInfo.organization.memberShipCategory,
                        },
                    ],
                },
            });
            if (!commission) {
                throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Commission info not found');
            }
            //* make date
            const validUntilDate = new Date();
            validUntilDate.setDate(validUntilDate.getDate() + validityDay.validDays);
            const newData = {
                code: referCode,
                validUntil: validUntilDate,
                isValid: true,
                commissionId: commission.id,
                codeOwnerorganizationId: payload.codeOwnerorganizationId,
                joiningRewardPointsId: joiningRewardInfo === null || joiningRewardInfo === void 0 ? void 0 : joiningRewardInfo.id,
                buyingRewardPointsId: buyingRewardInfo === null || buyingRewardInfo === void 0 ? void 0 : buyingRewardInfo.id,
                sellingRewardPointsId: sellingRewardInfo === null || sellingRewardInfo === void 0 ? void 0 : sellingRewardInfo.id,
            };
            if (!newData.code) {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Code not genaret');
            }
            if (!newData.buyingRewardPointsId ||
                !newData.joiningRewardPointsId ||
                !newData.sellingRewardPointsId) {
                throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Reward info not found');
            }
            const result = yield prisma.refferedCode.create({
                data: newData,
            });
            return result;
        }
    }));
    return result;
});
const getAll = (userId, userRole) => __awaiter(void 0, void 0, void 0, function* () {
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
        const result = yield prisma_1.default.refferedCode.findMany({
            include: {
                commission: true,
                codeOwnerOrganization: true,
                joiningRewardPoints: true,
                buyingRewardPoints: true,
                organizationUsedReffereCode: true,
            },
        });
        return result;
    }
    else {
        const userInfo = yield prisma_1.default.user.findUnique({
            where: { id: userId },
            include: { organization: true },
        });
        if (!userInfo || !userInfo.organizationId) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User info not found');
        }
        const result = yield prisma_1.default.refferedCode.findMany({
            where: { codeOwnerorganizationId: userInfo.organizationId },
            include: {
                commission: true,
                codeOwnerOrganization: true,
                joiningRewardPoints: true,
                buyingRewardPoints: true,
                organizationUsedReffereCode: true,
            },
        });
        return result;
    }
});
const getSingle = (referredCodeId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.refferedCode.findUnique({
        where: { id: referredCodeId },
        include: {
            commission: true,
            codeOwnerOrganization: true,
            joiningRewardPoints: true,
            buyingRewardPoints: true,
            organizationUsedReffereCode: { include: { organization: true } },
        },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Referred code not found');
    }
    return result;
});
const updateSingle = (referredCodeId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.refferedCode.findUnique({
        where: { id: referredCodeId },
    });
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Referred code not found');
    }
    const result = yield prisma_1.default.refferedCode.update({
        where: { id: referredCodeId },
        data: Object.assign({}, payload),
    });
});
const deleteSingle = (referredCodeId) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.refferedCode.findUnique({
        where: { id: referredCodeId },
    });
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Referred code not found');
    }
    const result = yield prisma_1.default.refferedCode.delete({
        where: { id: referredCodeId },
    });
    return result;
});
exports.ReferredCodeService = {
    createNew,
    getAll,
    getSingle,
    updateSingle,
    deleteSingle,
};
