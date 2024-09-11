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
exports.PointsValueServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const getValueOfReward = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.pointsValue.findMany();
    if ((result === null || result === void 0 ? void 0 : result.length) === 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Value of points are not created');
    }
    return result;
});
const createValueOfReward = (perPointsTk) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.pointsValue.findMany();
    if ((isExist === null || isExist === void 0 ? void 0 : isExist.length) > 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Value of points already created');
    }
    const result = yield prisma_1.default.pointsValue.create({ data: { perPointsTk } });
    return result;
});
const editPointsValue = (perPointsTk) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.pointsValue.findMany();
    if ((isExist === null || isExist === void 0 ? void 0 : isExist.length) === 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Value of points already created');
    }
    const result = yield prisma_1.default.pointsValue.update({
        where: { id: isExist[0].id },
        data: { perPointsTk },
    });
    return result;
});
const deletePointsValue = () => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.pointsValue.findMany();
    if ((isExist === null || isExist === void 0 ? void 0 : isExist.length) === 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Value of points already created');
    }
    const result = yield prisma_1.default.pointsValue.delete({
        where: { id: isExist[0].id },
    });
    return result;
});
exports.PointsValueServices = {
    createValueOfReward,
    getValueOfReward,
    editPointsValue,
    deletePointsValue,
};
