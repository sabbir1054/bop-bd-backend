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
exports.ProductRoutes = void 0;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const http_status_1 = __importDefault(require("http-status"));
const path_1 = __importDefault(require("path"));
const user_1 = require("../../../enums/user");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const fileUpload_1 = require("../../../helpers/fileUpload");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const products_controller_1 = require("./products.controller");
const products_validations_1 = require("./products.validations");
const router = express_1.default.Router();
router.post('/createProduct', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.SELLER), fileUpload_1.FileUploadHelper.upload.array('files', 5), (req, res, next) => {
    const multerReq = req;
    multerReq.body = products_validations_1.ProductsValidation.createProductValidation.parse(JSON.parse(multerReq.body.data));
    if (multerReq.files) {
        multerReq.body.fileUrls = multerReq.files.map(file => `/uploads/${file.filename}`);
    }
    return products_controller_1.ProductController.createProduct(multerReq, res, next);
});
router.get('/:id', products_controller_1.ProductController.getSingle);
router.get('/', products_controller_1.ProductController.getAllProducts);
router.delete('/deleteProductImage/:imageId/:productId', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.SELLER), products_controller_1.ProductController.deleteImageFromProduct);
router.patch('/addImages/:productId', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.SELLER), fileUpload_1.FileUploadHelper.upload.array('files', 5), // Ensure 'files' matches the field name used in the form
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const multerReq = req;
    try {
        if (multerReq.files) {
            multerReq.body.fileUrls = multerReq.files.map(file => `/uploads/${file.filename}`);
        }
        return yield products_controller_1.ProductController.addImageToProduct(multerReq, res, next);
    }
    catch (error) {
        return next(error); // Forward the error to the error handler
    }
}));
router.patch('/infoUpdate/:productId', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.SELLER), (0, validateRequest_1.default)(products_validations_1.ProductsValidation.updateProductInfoValidation), products_controller_1.ProductController.updateProductInfo);
router.delete('/:productId', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.SELLER), products_controller_1.ProductController.deleteProduct);
router.get('/image/:fileName', (req, res) => {
    const filePath = path_1.default.join(process.cwd(), 'uploads', path_1.default.basename(req.params.fileName));
    // Check if the file exists
    fs_1.default.access(filePath, fs_1.default.constants.F_OK, err => {
        if (err) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Image not found');
        }
        // Send the image file
        res.sendFile(filePath);
    });
});
exports.ProductRoutes = router;
