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
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const user_constant_1 = require("./user.constant");
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
    const data = req.body;
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        if (data.shop_name) {
            yield prisma.organization.update({
                where: { ownerId: isUserExist.id },
                data: { name: data.shop_name },
            });
        }
        const { shop_name } = data, updatedData = __rest(data, ["shop_name"]);
        console.log(req.body);
        if (isUserExist.photo && req.body.photo !== isUserExist.photo) {
            //* delete photo
            if (req.body.photo) {
                deletePhoto(isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.photo);
            }
            const result = yield prisma.user.update({
                where: { id: userId },
                data: Object.assign({}, updatedData),
                select: {
                    id: true,
                    role: true,
                    verified: true,
                    organization: true,
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
            return result;
        }
        else {
            const result = yield prisma.user.update({
                where: { id: userId },
                data: Object.assign({}, updatedData),
                select: {
                    id: true,
                    role: true,
                    verified: true,
                    organization: true,
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
            return result;
        }
    }));
    return result;
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
        select: {
            id: true,
            role: true,
            verified: true,
            organization: true,
            isMobileVerified: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            photo: true,
            license: true,
            nid: true,
        },
    });
    return result;
});
const getAll = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const { searchTerm, phone, verified, isMobileVerified, isNidVerified } = filters, filtersData = __rest(filters, ["searchTerm", "phone", "verified", "isMobileVerified", "isNidVerified"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: user_constant_1.userSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            })),
        });
    }
    if (Object.keys(filtersData).length) {
        const conditions = Object.entries(filtersData).map(([field, value]) => ({
            [field]: value,
        }));
        andConditions.push({ AND: conditions });
    }
    if (verified === 'true') {
        andConditions.push({ AND: { verified: true } });
    }
    if (verified === 'false') {
        andConditions.push({ AND: { verified: false } });
    }
    if (isMobileVerified === 'true') {
        andConditions.push({ AND: { isMobileVerified: true } });
    }
    if (isMobileVerified === 'false') {
        andConditions.push({ AND: { isMobileVerified: false } });
    }
    if (isNidVerified === 'true') {
        andConditions.push({ AND: { isNidVerified: true } });
    }
    if (isNidVerified === 'false') {
        andConditions.push({ AND: { isNidVerified: false } });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.user.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : {
                createdAt: 'desc',
            },
        select: {
            id: true,
            role: true,
            verified: true,
            organization: {
                include: {
                    BusinessType: true,
                    UsedReffereCode: true,
                },
            },
            isMobileVerified: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            isNidVerified: true,
            photo: true,
            license: true,
            nid: true,
        },
    });
    const total = yield prisma_1.default.user.count({
        where: whereConditions,
    });
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
});
const getSingle = (userId, profileId, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role === 'STAFF') {
        let result = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: profileId },
            include: {
                organization: {
                    include: {
                        owner: true,
                    },
                },
                staffInfo: true,
            },
        });
        if (!result) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found !');
        }
        result.staffInfo.password = '';
        return result;
    }
    const result = yield prisma_1.default.user.findUnique({
        where: { id: profileId },
        include: {
            organization: {
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
                    BusinessType: true,
                },
            },
        },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found !');
    }
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
const deleteUnverifiedOtp = (phone) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield prisma_1.default.user.findUnique({ where: { phone: phone } });
    const isOtpCreate = yield prisma_1.default.oneTimePassword.findUnique({
        where: { phone: phone },
    });
    if (isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.isMobileVerified) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User is verified. Please contact with admin for delete');
    }
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        if (isUserExist && isOtpCreate) {
            yield prisma.user.delete({ where: { phone: phone } });
            yield prisma.oneTimePassword.delete({ where: { phone: phone } });
        }
        else {
            if (isUserExist) {
                yield prisma.user.delete({ where: { phone: phone } });
            }
            if (isOtpCreate) {
                yield prisma.oneTimePassword.delete({ where: { phone: phone } });
            }
        }
        return 'Delete user';
    }));
    return result;
});
const userVerifiedStatusChange = (status, userId, role) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (role !== ('ADMIN' || 'SUPER_ADMIN')) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'You are not able to change');
    }
    const result = yield prisma_1.default.user.update({
        where: { id: userId },
        data: { verified: status },
    });
    return result;
});
const getOrganizationStaff = (userId, userRole, role) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const andConditions = [];
    let ownerId = null;
    if (userRole === 'STAFF') {
        const findOwnerId = yield prisma_1.default.user.findUnique({
            where: { id: userId },
            include: { Staff: { include: { organization: true } } },
        });
        if (((_a = findOwnerId === null || findOwnerId === void 0 ? void 0 : findOwnerId.Staff) === null || _a === void 0 ? void 0 : _a.role) !== 'STAFF_ADMIN') {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Only staff admins can see this');
        }
        if (!((_b = findOwnerId === null || findOwnerId === void 0 ? void 0 : findOwnerId.Staff) === null || _b === void 0 ? void 0 : _b.organization.ownerId)) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
        }
        ownerId = (_c = findOwnerId.Staff) === null || _c === void 0 ? void 0 : _c.organization.ownerId;
    }
    else {
        ownerId = userId;
    }
    if (!ownerId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Owner ID is required');
    }
    const organization = yield prisma_1.default.organization.findUnique({
        where: { ownerId },
    });
    if (!organization) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization not found');
    }
    andConditions.push({ organizationId: organization.id });
    if (role === null || role === void 0 ? void 0 : role.staffRole) {
        andConditions.push({ role: role.staffRole });
    }
    const staffMembers = yield prisma_1.default.staff.findMany({
        where: {
            AND: andConditions,
        },
        include: {
            staffInfo: {
                select: {
                    id: true,
                    role: true,
                    verified: true,
                    name: true,
                    email: true,
                    phone: true,
                    address: true,
                    isMobileVerified: true,
                },
            },
        },
    });
    return staffMembers;
});
const getMyDeliveryBoy = (userId, userRole) => __awaiter(void 0, void 0, void 0, function* () {
    let orgId = null;
    if (userRole === 'STAFF') {
        const isExistStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
        });
        if (!isExistStaff) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Staff info not found');
        }
        if (isExistStaff.role !== 'ORDER_SUPERVISOR') {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only order supervisor can get this');
        }
        orgId = isExistStaff.organizationId;
    }
    else {
        const isUserExist = yield prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!isUserExist) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User info not found');
        }
        orgId = isUserExist.organizationId;
    }
    if (!orgId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
    }
    const organization = yield prisma_1.default.organization.findUnique({
        where: { id: orgId },
    });
    if (!organization) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization not found');
    }
    const andConditions = [];
    andConditions.push({ organizationId: organization.id });
    andConditions.push({ role: 'DELIVERY_BOY' });
    const staffMembers = yield prisma_1.default.staff.findMany({
        where: {
            AND: andConditions,
        },
        include: {
            staffInfo: {
                select: {
                    id: true,
                    role: true,
                    verified: true,
                    name: true,
                    email: true,
                    phone: true,
                    address: true,
                    isMobileVerified: true,
                },
            },
        },
    });
    return staffMembers;
});
const deleteMySingleStaff = (userId, userRole, staffId) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistStaff = yield prisma_1.default.staff.findUnique({
        where: { id: staffId },
        include: {
            staffInfo: true,
        },
    });
    if (!isExistStaff) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Staff id not found');
    }
    if (userRole === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
            include: { staffInfo: true },
        });
        if ((isValidStaff === null || isValidStaff === void 0 ? void 0 : isValidStaff.role) !== 'STAFF_ADMIN') {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Only owner and admin staff can delete staff');
        }
    }
    const result = prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma.staff.delete({ where: { id: staffId } });
        const result = yield prisma.user.delete({
            where: { id: isExistStaff.staffInfoId },
        });
        return result;
    }));
    return result;
});
const updateMySingleStaffRole = (userId, userRole, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistStaff = yield prisma_1.default.staff.findUnique({
        where: { id: payload.staffId },
        include: {
            staffInfo: true,
        },
    });
    if (!isExistStaff) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Staff id not found');
    }
    if (userRole === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
            include: { staffInfo: true },
        });
        if ((isValidStaff === null || isValidStaff === void 0 ? void 0 : isValidStaff.role) !== 'STAFF_ADMIN') {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Only owner and admin staff can update staff');
        }
    }
    const result = yield prisma_1.default.staff.update({
        where: { id: payload.staffId },
        data: { role: payload.updatedRole },
    });
    return result;
});
exports.UserServices = {
    updateUserProfile,
    removeProfilePicture,
    getAll,
    getSingle,
    deleteUnverifiedOtp,
    userVerifiedStatusChange,
    getOrganizationStaff,
    getMyDeliveryBoy,
    deleteMySingleStaff,
    updateMySingleStaffRole,
};
