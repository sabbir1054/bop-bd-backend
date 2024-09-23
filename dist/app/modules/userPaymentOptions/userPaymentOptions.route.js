"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPaymentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const userPaymentOptions_controller_1 = require("./userPaymentOptions.controller");
const userPaymentOptions_validation_1 = require("./userPaymentOptions.validation");
const router = express_1.default.Router();
router.post('/create', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.STAFF, user_1.ENUM_USER_ROLE.WHOLESALER), (0, validateRequest_1.default)(userPaymentOptions_validation_1.UserPaymentOptionsValidation.createUserPaymentOptions), userPaymentOptions_controller_1.UserPaymentOptionsController.createPaymentOptions);
router.get('/:organizationId', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.STAFF, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), userPaymentOptions_controller_1.UserPaymentOptionsController.organizationAllPaymentOptions);
router.patch('/:organizationId/:paymentSystemOptionsId', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.STAFF, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), (0, validateRequest_1.default)(userPaymentOptions_validation_1.UserPaymentOptionsValidation.updateUserPaymentOptions), userPaymentOptions_controller_1.UserPaymentOptionsController.updateOrganizationPaymentOptions);
router.delete('/:organizationId/:paymentSystemOptionsId', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.STAFF, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), userPaymentOptions_controller_1.UserPaymentOptionsController.deleteorganizationPaymentOptions);
exports.UserPaymentRoutes = router;
