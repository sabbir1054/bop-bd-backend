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
exports.CategoryServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const createNew = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isBusinessTypeExist = yield prisma_1.default.businessType.findUnique({
        where: { id: payload.businessTypeId },
    });
    if (!isBusinessTypeExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Business type not found !');
    }
    const result = yield prisma_1.default.category.create({
        data: {
            eng_name: payload.eng_name,
            bn_name: payload.bn_name,
            businessType: { connect: { id: payload.businessTypeId } },
        },
    });
    return result;
});
const getAll = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.category.findMany({
        include: { businessType: true },
    });
    return result;
});
const getSingle = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.category.findUnique({
        where: { id },
        include: { businessType: true },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Category not found !');
    }
    return result;
});
const updateSingle = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const { businessTypeId } = data, othersData = __rest(data, ["businessTypeId"]);
    const isExist = yield prisma_1.default.category.findUnique({ where: { id } });
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Category not found !');
    }
    const updateData = {};
    if (businessTypeId) {
        updateData.businessType = { connect: { id: businessTypeId } };
    }
    if (othersData.bn_name) {
        updateData.bn_name = othersData.bn_name;
    }
    if (othersData.eng_name) {
        updateData.eng_name = othersData.eng_name;
    }
    const result = yield prisma_1.default.category.update({
        where: { id: id },
        data: updateData,
    });
    return result;
});
const deleteSingle = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.category.findUnique({ where: { id } });
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Category not found !');
    }
    const result = yield prisma_1.default.category.delete({ where: { id } });
    return result;
});
exports.CategoryServices = {
    createNew,
    getAll,
    getSingle,
    updateSingle,
    deleteSingle,
};
