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
exports.ReferCodeValidityServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const createNew = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.validityDays.findMany();
    if ((isExist === null || isExist === void 0 ? void 0 : isExist.length) > 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Validity days already created ');
    }
    const result = yield prisma_1.default.validityDays.create({
        data: payload,
    });
    return result;
});
const getAll = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.validityDays.findMany();
    return result;
});
const updateSingle = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.validityDays.findFirst();
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Validity days not found !');
    }
    const result = yield prisma_1.default.validityDays.update({
        where: { id: isExist.id },
        data,
    });
    return result;
});
const deleteSingle = () => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.validityDays.findFirst();
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Business type not found !');
    }
    const result = yield prisma_1.default.validityDays.delete({
        where: { id: isExist.id },
    });
    return result;
});
exports.ReferCodeValidityServices = {
    createNew,
    getAll,
    updateSingle,
    deleteSingle,
};
