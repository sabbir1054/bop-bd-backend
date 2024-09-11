"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRoutes = void 0;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const http_status_1 = __importDefault(require("http-status"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../../../config"));
const user_1 = require("../../../enums/user");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const fileUpload_1 = require("../../../helpers/fileUpload");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const category_controller_1 = require("./category.controller");
const category_validation_1 = require("./category.validation");
const router = express_1.default.Router();
/* router.post(
  '/create',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(CategoryZodValidation.createCategoryValidation),
  CategoryController.createNew,
);
 */
router.post('/create', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), fileUpload_1.FileUploadHelper.uploadCategoryPhoto.single('file'), (req, res, next) => {
    var _a, _b;
    const multerReq = req;
    multerReq.body = (_a = category_validation_1.CategoryZodValidation === null || category_validation_1.CategoryZodValidation === void 0 ? void 0 : category_validation_1.CategoryZodValidation.createCategoryValidation) === null || _a === void 0 ? void 0 : _a.parse(JSON === null || JSON === void 0 ? void 0 : JSON.parse((_b = multerReq.body) === null || _b === void 0 ? void 0 : _b.data));
    if (multerReq.file) {
        multerReq.body.photo = `${config_1.default.api_link_Image}/api/v1/category/image/${multerReq.file.filename}`;
    }
    return category_controller_1.CategoryController.createNew(multerReq, res, next);
});
//get picture
router.get('/image/:fileName', (req, res) => {
    const filePath = path_1.default.join(process.cwd(), 'uploads/categoryPhoto', path_1.default.basename(req.params.fileName));
    // Check if the file exists
    fs_1.default.access(filePath, fs_1.default.constants.F_OK, err => {
        if (err) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Image not found');
        }
        // Send the image file
        res.sendFile(filePath);
    });
});
//remove photo
router.delete('/removePhoto/:categoryId', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), category_controller_1.CategoryController.removePhoto);
router.patch('/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), fileUpload_1.FileUploadHelper.uploadCategoryPhoto.single('file'), (req, res, next) => {
    var _a, _b;
    const multerReq = req;
    multerReq.body = (_a = category_validation_1.CategoryZodValidation === null || category_validation_1.CategoryZodValidation === void 0 ? void 0 : category_validation_1.CategoryZodValidation.updateCategoryValidation) === null || _a === void 0 ? void 0 : _a.parse(JSON === null || JSON === void 0 ? void 0 : JSON.parse((_b = multerReq.body) === null || _b === void 0 ? void 0 : _b.data));
    if (multerReq.file) {
        multerReq.body.photo = `${config_1.default.api_link_Image}/api/v1/category/image/${multerReq.file.filename}`;
    }
    return category_controller_1.CategoryController.updateSingle(multerReq, res, next);
});
router.delete('/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), category_controller_1.CategoryController.deleteSingle);
router.get('/:id', category_controller_1.CategoryController.getSingle);
router.get('/', category_controller_1.CategoryController.getAll);
exports.CategoryRoutes = router;
