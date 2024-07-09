"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRoutes = void 0;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const http_status_1 = __importDefault(require("http-status"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../../../config"));
const user_1 = require("../../../enums/user");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const fileUpload_1 = require("../../../helpers/fileUpload");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_validation_1 = require("./user.validation");
const users_controller_1 = require("./users.controller");
const router = express_1.default.Router();
router.patch('/updateProfile', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.WHOLESALER), fileUpload_1.FileUploadHelper.uploadProfile.single('file'), (req, res, next) => {
    var _a, _b, _c;
    if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.data) {
        req.body = (_b = user_validation_1.UsersValidation === null || user_validation_1.UsersValidation === void 0 ? void 0 : user_validation_1.UsersValidation.updateUserProfileValidation) === null || _b === void 0 ? void 0 : _b.parse(JSON === null || JSON === void 0 ? void 0 : JSON.parse((_c = req.body) === null || _c === void 0 ? void 0 : _c.data));
    }
    if (req.file) {
        req.body.photo = `${config_1.default.api_link_Image}/api/v1/users/profile/image/${req.file.filename}`;
    }
    return users_controller_1.UserController.updateUserProfile(req, res, next);
});
router.delete('/removeProfilePicture', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.WHOLESALER), users_controller_1.UserController.removeProfilePicture);
router.get('/:profileId', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.STAFF), users_controller_1.UserController.getSingle);
router.get('/', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), users_controller_1.UserController.getAll);
router.get('/profile/image/:fileName', (req, res) => {
    const filePath = path_1.default.join(process.cwd(), 'uploads/userPhoto', path_1.default.basename(req.params.fileName));
    // Check if the file exists
    fs_1.default.access(filePath, fs_1.default.constants.F_OK, err => {
        if (err) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Image not found');
        }
        // Send the image file
        res.sendFile(filePath);
    });
});
router.delete('/deleteUnverified', users_controller_1.UserController.deleteUnverifiedOtp);
router.post('/update/status', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), (0, validateRequest_1.default)(user_validation_1.UsersValidation.userVerifiedStatusChangeValidation), users_controller_1.UserController.userVerifiedStatusChange);
exports.UsersRoutes = router;
