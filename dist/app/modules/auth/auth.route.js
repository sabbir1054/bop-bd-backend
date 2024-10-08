"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_controller_1 = require("./auth.controller");
const auth_validation_1 = require("./auth.validation");
const router = express_1.default.Router();
router.post('/signup', (0, validateRequest_1.default)(auth_validation_1.AuthValidation.userRegistrationValidation), auth_controller_1.AuthController.userRegistration);
router.post('/signin', (0, validateRequest_1.default)(auth_validation_1.AuthValidation.userLoginValidation), auth_controller_1.AuthController.userLogin);
router.post('/refreshToken', (0, validateRequest_1.default)(auth_validation_1.AuthValidation.refreshTokenZodSchema), auth_controller_1.AuthController.refreshToken);
router.post('/verifyOtp', auth_controller_1.AuthController.verifyOtp);
router.post('/resendOtp', auth_controller_1.AuthController.resendOtp);
router.post('/forgetPassword/sendOtp', auth_controller_1.AuthController.forgetPasswordOtp);
router.post('/forgetPassword/resendOtp', auth_controller_1.AuthController.resendForgetpasswordOtp);
router.post('/forgetPassword/verifyOtp', (0, validateRequest_1.default)(auth_validation_1.AuthValidation.userPasswordValidation), auth_controller_1.AuthController.verifyForgotPasswordOtp);
router.patch('/updatePassword', auth_controller_1.AuthController.updatePassword);
exports.AuthRoutes = router;
