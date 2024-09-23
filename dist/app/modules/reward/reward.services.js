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
exports.RewardServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const createNew = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.rewardPoints.findFirst({
        where: {
            AND: [
                {
                    rewardType: payload.rewardType,
                    membershipCategory: payload.membershipCategory,
                },
            ],
        },
    });
    if (isExist) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You have already create it now you can update or delete');
    }
    const validDays = yield prisma_1.default.validityDays.findFirst();
    if (!validDays) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Valid days not found');
    }
    const result = yield prisma_1.default.rewardPoints.create({
        data: payload,
    });
    return result;
});
const getAll = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.rewardPoints.findMany({
        include: { organizationRewardPoints: true },
    });
    return result;
});
const getSingle = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.rewardPoints.findUnique({
        where: { id },
        include: {
            organizationRewardPoints: {
                include: {
                    organization: true,
                },
            },
        },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Reward info not found !');
    }
    return result;
});
const updateSingle = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.rewardPoints.findUnique({ where: { id } });
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Reward points not found !');
    }
    const result = yield prisma_1.default.rewardPoints.update({ where: { id }, data });
    return result;
});
const deleteSingle = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.rewardPoints.findUnique({ where: { id } });
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Reward not found !');
    }
    const result = yield prisma_1.default.rewardPoints.delete({ where: { id } });
    return result;
});
exports.RewardServices = {
    createNew,
    getAll,
    getSingle,
    updateSingle,
    deleteSingle,
};
