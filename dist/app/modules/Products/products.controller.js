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
exports.ProductController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const paginationFields_1 = require("../../../constants/paginationFields");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const pick_1 = __importDefault(require("../../../shared/pick"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const product_constant_1 = require("./product.constant");
const products_service_1 = require("./products.service");
const createProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield products_service_1.ProductServices.createNew(req);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Product added ',
        data: result,
    });
}));
const getAllProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.default)(req.query, product_constant_1.productFilterableFields);
    const options = (0, pick_1.default)(req.query, paginationFields_1.paginationFields);
    const result = yield products_service_1.ProductServices.getAllProduct(filters, options);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Product retrieve successfully !!',
        meta: result.meta,
        data: result.data,
    });
}));
const getSingle = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield products_service_1.ProductServices.getSingle(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Product retrieve ',
        data: result,
    });
}));
const deleteImageFromProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { imageId, productId } = req.params;
    const { id: ownerId } = req.user;
    const result = yield products_service_1.ProductServices.deleteImageFromProduct(imageId, productId, ownerId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Product photo updated ',
        data: result,
    });
}));
const addImageToProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield products_service_1.ProductServices.addNewImageForProduct(req);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Product photo updated ',
        data: result,
    });
}));
const updateProductInfo = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const { id: ownerId } = req.user;
    const payload = req.body;
    const result = yield products_service_1.ProductServices.updateProductInfo(productId, ownerId, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Product info updated ',
        data: result,
    });
}));
const deleteProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const { id: ownerId } = req.user;
    const result = yield products_service_1.ProductServices.deleteProduct(productId, ownerId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Product deleted ',
        data: result,
    });
}));
exports.ProductController = {
    createProduct,
    getAllProducts,
    getSingle,
    deleteImageFromProduct,
    addImageToProduct,
    updateProductInfo,
    deleteProduct,
};
