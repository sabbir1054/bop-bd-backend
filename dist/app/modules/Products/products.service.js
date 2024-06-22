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
const fs_1 = __importDefault(require("fs"));
const http_status_1 = __importDefault(require("http-status"));
const path_1 = __importDefault(require("path"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const product_constant_1 = require("./product.constant");
const createNew = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const _b = req.body, { ownerId, categoryId, fileUrls } = _b, others = __rest(_b, ["ownerId", "categoryId", "fileUrls"]);
    const { id: userId } = req.user;
    if (ownerId !== userId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Owner id does not match with user');
    }
    const ownerBusinessTypeCheck = yield prisma_1.default.user.findUnique({
        where: { id: userId },
        include: {
            businessType: {
                include: {
                    category: true,
                },
            },
        },
    });
    if (!ownerBusinessTypeCheck || !(ownerBusinessTypeCheck === null || ownerBusinessTypeCheck === void 0 ? void 0 : ownerBusinessTypeCheck.businessTypeId)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Please set user business type and complete profile');
    }
    // Extract the array of category IDs
    const categoryIds = (_a = ownerBusinessTypeCheck.businessType) === null || _a === void 0 ? void 0 : _a.category.map(cat => cat.id);
    // Check if the specific category ID is in the array
    const isCategoryPresent = categoryIds === null || categoryIds === void 0 ? void 0 : categoryIds.includes(categoryId);
    if (!isCategoryPresent) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Category ID is not associated with the user's business type");
    }
    const result = yield prisma_1.default.product.create({
        data: Object.assign({ owner: { connect: { id: ownerId } }, category: { connect: { id: categoryId } }, images: {
                create: fileUrls.map((url) => ({ url })),
            } }, others),
        include: {
            owner: true,
            images: true,
            category: true,
        },
    });
    return result;
});
const getAllProduct = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelpers.calculatePagination(options);
    const { searchTerm, minPrice, maxPrice, address, category, ownerType } = filters, filtersData = __rest(filters, ["searchTerm", "minPrice", "maxPrice", "address", "category", "ownerType"]);
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
    if (address) {
        andConditions.push({
            owner: {
                address: {
                    contains: address,
                    mode: 'insensitive',
                },
            },
        });
    }
    if (category) {
        andConditions.push({
            categoryId: category,
        });
    }
    if (ownerType) {
        andConditions.push({
            owner: {
                role: ownerType,
            },
        });
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
            owner: {
                select: {
                    id: true,
                    memberCategory: true,
                    verified: true,
                    name: true,
                    phone: true,
                    address: true,
                    photo: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
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
            owner: {
                select: {
                    id: true,
                    memberCategory: true,
                    verified: true,
                    name: true,
                    phone: true,
                    address: true,
                    photo: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
            category: true,
            images: true,
            feedbacks: true,
        },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Product details not found');
    }
    return result;
});
const deleteImageFromProduct = (imageId, productId, ownerId) => __awaiter(void 0, void 0, void 0, function* () {
    const isProductExist = yield prisma_1.default.product.findUnique({
        where: { id: productId },
        include: {
            owner: {
                select: {
                    id: true,
                    memberCategory: true,
                    verified: true,
                    name: true,
                    phone: true,
                    address: true,
                    photo: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
            category: true,
            images: true,
            feedbacks: true,
        },
    });
    if (!isProductExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Product not found ');
    }
    if ((isProductExist === null || isProductExist === void 0 ? void 0 : isProductExist.ownerId) !== ownerId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Only owner can update products ');
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
            owner: {
                select: {
                    id: true,
                    memberCategory: true,
                    verified: true,
                    name: true,
                    phone: true,
                    address: true,
                    photo: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
            category: true,
            images: true,
            feedbacks: true,
        },
    });
    return result;
});
const addNewImageForProduct = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const { id: ownerId } = req.user;
    const { fileUrls } = req.body;
    const isProductExist = yield prisma_1.default.product.findUnique({
        where: { id: productId },
        include: {
            owner: {
                select: {
                    id: true,
                    memberCategory: true,
                    verified: true,
                    name: true,
                    phone: true,
                    address: true,
                    photo: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
            category: true,
            images: true,
            feedbacks: true,
        },
    });
    if (!isProductExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Product not found ');
    }
    if ((isProductExist === null || isProductExist === void 0 ? void 0 : isProductExist.ownerId) !== ownerId) {
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
            owner: {
                select: {
                    id: true,
                    memberCategory: true,
                    verified: true,
                    name: true,
                    phone: true,
                    address: true,
                    photo: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
            category: true,
            images: true,
            feedbacks: true,
        },
    });
    return result;
});
const updateProductInfo = (productId, ownerId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!payload) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'No update data provided');
    }
    const { categoryId } = payload, othersInfo = __rest(payload, ["categoryId"]);
    const isProductExist = yield prisma_1.default.product.findUnique({
        where: { id: productId },
        include: {
            owner: {
                select: {
                    id: true,
                    memberCategory: true,
                    verified: true,
                    name: true,
                    phone: true,
                    address: true,
                    photo: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
            category: true,
            images: true,
            feedbacks: true,
        },
    });
    if (!isProductExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Product not found ');
    }
    if ((isProductExist === null || isProductExist === void 0 ? void 0 : isProductExist.ownerId) !== ownerId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Only owner can update products ');
    }
    const result = yield prisma_1.default.product.update({
        where: { id: productId },
        data: Object.assign(Object.assign({}, othersInfo), (categoryId && { category: { connect: { id: categoryId } } })),
    });
    return result;
});
const deleteProduct = (productId, ownerId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(productId);
    const isProductExist = yield prisma_1.default.product.findUnique({
        where: { id: productId },
    });
    if (!isProductExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Product not found ');
    }
    if ((isProductExist === null || isProductExist === void 0 ? void 0 : isProductExist.ownerId) !== ownerId) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Only product owner can delete products ');
    }
    const result = yield prisma_1.default.product.delete({
        where: { id: productId },
    });
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
