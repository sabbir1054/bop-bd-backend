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
exports.UserServices = void 0;
const fs_1 = __importDefault(require("fs"));
const http_status_1 = __importDefault(require("http-status"));
const path_1 = __importDefault(require("path"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const updateUserProfile = (req, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const deletePhoto = (photoLink) => {
        // Delete the image file from the server
        const filePath = path_1.default.join(process.cwd(), 'uploads/userPhoto', path_1.default.basename(photoLink));
        fs_1.default.unlink(filePath, err => {
            if (err) {
                deletePhoto(req.body.photo);
                next(new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Failed to delete previous image, try again for update,photo `));
            }
        });
    };
    const isUserExist = yield prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!isUserExist) {
        //* delete uploaded photo
        deletePhoto(req.body.photo);
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not exist');
    }
    //* make updated data
    const _a = req.body, { businessTypeId } = _a, others = __rest(_a, ["businessTypeId"]);
    const updatedData = others;
    if (businessTypeId) {
        updatedData.businessType = { connect: { id: businessTypeId } };
    }
    if (isUserExist.photo && req.body.photo !== isUserExist.photo) {
        //* delete photo
        deletePhoto(isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.photo);
        const result = yield prisma_1.default.user.update({
            where: { id: userId },
            data: Object.assign({}, updatedData),
        });
        return result;
    }
    else {
        const result = yield prisma_1.default.user.update({
            where: { id: userId },
            data: Object.assign({}, updatedData),
        });
        return result;
    }
});
const removeProfilePicture = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not exist');
    }
    if (!isUserExist.photo) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User has not any picture');
    }
    const filePath = path_1.default.join(process.cwd(), 'uploads/userPhoto', path_1.default.basename(isUserExist.photo));
    fs_1.default.unlink(filePath, err => {
        if (err) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Failed to delete image: ${filePath}`);
        }
    });
    const result = yield prisma_1.default.user.update({
        where: { id: userId },
        data: {
            photo: '',
        },
    });
    return result;
});
const getAll = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.findMany({
        select: {
            id: true,
            role: true,
            email: true,
            license: true,
            nid: true,
            memberCategory: true,
            verified: true,
            name: true,
            phone: true,
            address: true,
            photo: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return result;
});
const getSingle = (userId, profileId, role) => __awaiter(void 0, void 0, void 0, function* () {
    let result = yield prisma_1.default.user.findUnique({
        where: { id: profileId },
        include: {
            feedbacks: true,
            cart: {
                include: {
                    CartItem: true,
                },
            },
            products: true,
            outgoing_order: {
                include: { orderItems: true },
            },
            incoming_order: {
                include: { orderItems: true },
            },
        },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found !');
    }
    result.password = '';
    if (role === ('ADMIN' || 'SUPER_ADMIN')) {
        return result;
    }
    else {
        if (userId !== result.id) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You can only see you profile');
        }
        else {
            return result;
        }
    }
});
exports.UserServices = {
    updateUserProfile,
    removeProfilePicture,
    getAll,
    getSingle,
};
