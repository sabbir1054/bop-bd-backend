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
exports.ProductServices = void 0;
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const http_status_1 = __importDefault(require("http-status"));
const path_1 = __importDefault(require("path"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const product_constant_1 = require("./product.constant");
const createNew = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const _b = req.body, { categoryId, fileUrls } = _b, others = __rest(_b, ["categoryId", "fileUrls"]);
    const { id: userId, role } = req.user;
    let orgId = null;
    if (role === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
            include: {
                organization: true,
            },
        });
        if (!isValidStaff || !isValidStaff.isValidNow) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Staff  is invalid');
        }
        else {
            if (isValidStaff.role === 'STORE_MANAGER' ||
                isValidStaff.role === 'STAFF_ADMIN') {
                orgId = isValidStaff.organization.id;
            }
            else {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only store manager or admin update product info');
            }
        }
    }
    else {
        const isExistUser = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!isExistUser) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'No user found');
        }
        orgId = isExistUser.organizationId;
    }
    if (!orgId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Organization info not found');
    }
    //* organization info
    const organizationInfo = yield prisma_1.default.organization.findUnique({
        where: { id: orgId },
        include: { owner: true, BusinessType: { include: { category: true } } },
    });
    if (!(organizationInfo === null || organizationInfo === void 0 ? void 0 : organizationInfo.owner.verified)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Organization not verified');
    }
    if (!(organizationInfo === null || organizationInfo === void 0 ? void 0 : organizationInfo.businessTypeId)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Please set user business type and complete profile');
    }
    // Extract the array of category IDs
    const categoryIds = (_a = organizationInfo.BusinessType) === null || _a === void 0 ? void 0 : _a.category.map(cat => cat.id);
    // Check if the specific category ID is in the array
    const isCategoryPresent = categoryIds === null || categoryIds === void 0 ? void 0 : categoryIds.includes(categoryId);
    if (!isCategoryPresent) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Category ID is not associated with the user's business type");
    }
    const result = yield prisma_1.default.product.create({
        data: Object.assign({ organizationId: organizationInfo.id, categoryId: categoryId, images: {
                create: fileUrls.map((url) => ({ url })),
            } }, others),
        include: {
            organization: true,
            images: true,
            category: true,
        },
    });
    return result;
});
const getAllProduct = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const { searchTerm, minPrice, maxPrice, address, category, orgId, ownerType } = filters, filtersData = __rest(filters, ["searchTerm", "minPrice", "maxPrice", "address", "category", "orgId", "ownerType"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: product_constant_1.productSearchableFields.map(field => ({
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
    const minPriceFloat = parseFloat(minPrice);
    const maxPriceFloat = parseFloat(maxPrice);
    if (!isNaN(minPriceFloat)) {
        andConditions.push({
            price: {
                gte: minPriceFloat,
            },
        });
    }
    if (!isNaN(maxPriceFloat)) {
        andConditions.push({
            price: {
                lte: maxPriceFloat,
            },
        });
    }
    if (orgId) {
        andConditions.push({
            organizationId: orgId,
        });
    }
    if (address) {
        andConditions.push({
            organization: {
                owner: {
                    address: {
                        contains: address,
                        mode: 'insensitive',
                    },
                },
            },
        });
    }
    if (category) {
        andConditions.push({
            categoryId: category,
        });
    }
    if (ownerType && Object.values(client_1.Role).includes(ownerType)) {
        andConditions.push({
            organization: {
                owner: {
                    role: ownerType,
                },
            },
        });
    }
    else if (ownerType) {
        throw new Error(`Invalid role type: ${ownerType}`);
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.product.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : {
                createdAt: 'desc',
            },
        include: {
            organization: { include: { BusinessType: true } },
            category: true,
            images: true,
            feedbacks: true,
        },
    });
    const total = yield prisma_1.default.product.count({
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
const getSingle = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.product.findUnique({
        where: { id },
        include: {
            organization: {
                include: {
                    owner: true,
                    BusinessType: true,
                },
            },
            category: true,
            images: true,
            feedbacks: {
                include: {
                    Organization: true,
                },
            },
        },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Product details not found');
    }
    return result;
});
const deleteImageFromProduct = (imageId, productId, userId, userRole) => __awaiter(void 0, void 0, void 0, function* () {
    let orgId = null;
    if (userRole === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
            include: { organization: true },
        });
        if (!isValidStaff || !isValidStaff.isValidNow) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Staff is invalid');
        }
        if (isValidStaff.role === 'STORE_MANAGER' ||
            isValidStaff.role === 'STAFF_ADMIN') {
            orgId = isValidStaff.organization.id;
        }
        else {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only store manager or admin update product info');
        }
    }
    else {
        if (!userId) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User info not found');
        }
        const isUserExist = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        orgId = isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.organizationId;
    }
    const isProductExist = yield prisma_1.default.product.findUnique({
        where: { id: productId },
        include: {
            organization: true,
            category: true,
            images: true,
            feedbacks: true,
        },
    });
    if (!isProductExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Product not found ');
    }
    if ((isProductExist === null || isProductExist === void 0 ? void 0 : isProductExist.organizationId) !== orgId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Invalid staff/owner  ');
    }
    const isImageExist = yield prisma_1.default.image.findUnique({
        where: { id: imageId, productId: productId },
    });
    if (!isImageExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Image not found ');
    }
    // Delete the image file from the server
    const filePath = path_1.default.join(process.cwd(), 'uploads', path_1.default.basename(isImageExist.url));
    fs_1.default.unlink(filePath, err => {
        if (err) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Failed to delete image: ${filePath}`);
        }
    });
    // Delete the image from the database
    yield prisma_1.default.image.delete({
        where: { id: imageId },
    });
    const result = yield prisma_1.default.product.findUnique({
        where: { id: productId },
        include: {
            organization: true,
            category: true,
            images: true,
            feedbacks: true,
        },
    });
    return result;
});
const addNewImageForProduct = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const { id: userId, role: userRole } = req.user;
    const { fileUrls } = req.body;
    let orgId = null;
    if (userRole === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
            include: { organization: true },
        });
        if (!isValidStaff || !isValidStaff.isValidNow) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Staff is invalid');
        }
        if (isValidStaff.role === 'STORE_MANAGER' ||
            isValidStaff.role === 'STAFF_ADMIN') {
            orgId = isValidStaff.organization.id;
        }
        else {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only store manager or admin update product info');
        }
    }
    else {
        const isUserExist = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        orgId = isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.organizationId;
    }
    const isProductExist = yield prisma_1.default.product.findUnique({
        where: { id: productId },
        include: {
            organization: true,
            category: true,
            images: true,
            feedbacks: true,
        },
    });
    if (!orgId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
    }
    if (!isProductExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Product not found ');
    }
    if ((isProductExist === null || isProductExist === void 0 ? void 0 : isProductExist.organizationId) !== orgId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Only owner can update products ');
    }
    //* check number of images
    const currentImageCount = isProductExist.images.length;
    const newImagesCount = fileUrls.length;
    if (currentImageCount + newImagesCount > 5) {
        const availableSlots = 5 - currentImageCount;
        if (availableSlots < newImagesCount) {
            const excessFiles = fileUrls.slice(availableSlots);
            excessFiles.forEach((url) => {
                const filePath = path_1.default.join(process.cwd(), 'uploads', path_1.default.basename(url));
                fs_1.default.unlink(filePath, err => {
                    if (err) {
                        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Failed to delete image: ${filePath}`);
                    }
                });
            });
        }
        // Trim the fileUrls array to fit the available slots
        fileUrls.splice(availableSlots, newImagesCount - availableSlots);
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `You can upload only ${availableSlots} images`);
    }
    const result = yield prisma_1.default.product.update({
        where: { id: productId },
        data: {
            images: {
                create: fileUrls.map((url) => ({ url })),
            },
        },
        include: {
            organization: true,
            category: true,
            images: true,
            feedbacks: true,
        },
    });
    return result;
});
const updateProductInfo = (productId, userId, userRole, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!payload) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'No update data provided');
    }
    let orgId = null;
    if (userRole === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
            include: { organization: true },
        });
        if (!isValidStaff || !isValidStaff.isValidNow) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Staff is invalid');
        }
        if (isValidStaff.role === 'STORE_MANAGER' ||
            isValidStaff.role === 'STAFF_ADMIN') {
            orgId = isValidStaff.organization.id;
        }
        else {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only store manager or admin update product info');
        }
    }
    else {
        const isUserExist = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        orgId = isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.organizationId;
    }
    const { categoryId } = payload, othersInfo = __rest(payload, ["categoryId"]);
    const isProductExist = yield prisma_1.default.product.findUnique({
        where: { id: productId },
        include: {
            organization: true,
            category: true,
            images: true,
            feedbacks: true,
        },
    });
    if (!isProductExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Product not found ');
    }
    if (!orgId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
    }
    if ((isProductExist === null || isProductExist === void 0 ? void 0 : isProductExist.organizationId) !== orgId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Invalid owner info ');
    }
    const result = yield prisma_1.default.product.update({
        where: { id: productId },
        data: Object.assign(Object.assign({}, othersInfo), (categoryId && { category: { connect: { id: categoryId } } })),
    });
    return result;
});
const deleteProduct = (productId, userId, userRole) => __awaiter(void 0, void 0, void 0, function* () {
    let orgId = null;
    if (userRole === 'STAFF') {
        const isValidStaff = yield prisma_1.default.staff.findUnique({
            where: { staffInfoId: userId },
            include: { organization: true },
        });
        if (!isValidStaff || !isValidStaff.isValidNow) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Staff is invalid');
        }
        if (isValidStaff.role === 'STORE_MANAGER' ||
            isValidStaff.role === 'STAFF_ADMIN') {
            orgId = isValidStaff.organization.id;
        }
        else {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Only store manager or admin update product info');
        }
    }
    else {
        if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
            const productOwner = yield prisma_1.default.product.findUnique({
                where: { id: productId },
            });
            orgId = productOwner === null || productOwner === void 0 ? void 0 : productOwner.organizationId;
        }
        else {
            const isUserExist = yield prisma_1.default.user.findUnique({
                where: { id: userId },
            });
            orgId = isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.organizationId;
        }
    }
    // Check if the product exists
    const isProductExist = yield prisma_1.default.product.findUnique({
        where: { id: productId },
        include: {
            images: true,
        },
    });
    if (!isProductExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Product not found');
    }
    if (!orgId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Organization info not found');
    }
    // Check if the owner is the same as the one making the request
    if (isProductExist.organizationId !== orgId) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Invalid owner info');
    }
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // Delete images from the server
        for (const image of isProductExist.images) {
            const filePath = path_1.default.join(process.cwd(), 'uploads', path_1.default.basename(image.url));
            fs_1.default.unlink(filePath, err => {
                if (err) {
                    console.error(`Failed to delete image: ${filePath}`);
                }
            });
        }
        // Delete image records from the database
        yield prisma.image.deleteMany({
            where: { productId: productId },
        });
        // Delete the product
        const result = yield prisma.product.delete({
            where: { id: productId },
        });
        return result;
    }));
    return result;
});
exports.ProductServices = {
    createNew,
    getAllProduct,
    getSingle,
    deleteImageFromProduct,
    addNewImageForProduct,
    updateProductInfo,
    deleteProduct,
};
