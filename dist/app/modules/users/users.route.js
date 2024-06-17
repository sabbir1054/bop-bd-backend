"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const fileUpload_1 = require("../../../helpers/fileUpload");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_validation_1 = require("./user.validation");
const users_controller_1 = require("./users.controller");
const router = express_1.default.Router();
router.patch('/updateProfile', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.SELLER, user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.WHOLESALER), fileUpload_1.FileUploadHelper.uploadProfile.single('file'), (req, res, next) => {
    req.body = user_validation_1.UsersValidation.updateUserProfileValidation.parse(JSON.parse(req.body.data));
    if (req.file) {
        req.body.photo = `/uploads/${req.file.filename}`;
    }
    return users_controller_1.UserController.updateUserProfile(req, res, next);
});
router.delete('/removeProfilePicture', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.SELLER, user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.WHOLESALER), users_controller_1.UserController.removeProfilePicture);
router.get('/:profileId', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.SELLER, user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.WHOLESALER), users_controller_1.UserController.getSingle);
router.get('/', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), users_controller_1.UserController.getAll);
exports.UsersRoutes = router;
