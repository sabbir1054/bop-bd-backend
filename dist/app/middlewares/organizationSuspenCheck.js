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
exports.checkSuspension = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../shared/prisma"));
const checkSuspension = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id, role } = req.user;
    try {
        if (role === 'STAFF') {
            const staffInf = yield prisma_1.default.staff.findUnique({
                where: { staffInfoId: id },
                include: {
                    organization: true,
                },
            });
            if (!staffInf) {
                throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Staff info not found');
            }
            if (((_a = staffInf.organization) === null || _a === void 0 ? void 0 : _a.isSuspend) === true) {
                throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Your organization accound is suspend');
            }
        }
        else {
            const userInfo = yield prisma_1.default.user.findUnique({
                where: { id },
                include: {
                    organization: true,
                },
            });
            if (!userInfo) {
                throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User info not found');
            }
            if (((_b = userInfo.organization) === null || _b === void 0 ? void 0 : _b.isSuspend) === true) {
                throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Your organization accound is suspend');
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.checkSuspension = checkSuspension;
