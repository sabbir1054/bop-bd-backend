"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const organizationSuspenCheck_1 = require("../../middlewares/organizationSuspenCheck");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const cart_controller_1 = require("./cart.controller");
const cart_validation_1 = require("./cart.validation");
const router = express_1.default.Router();
router.post('/updateCartSingle/:productId', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.STAFF), organizationSuspenCheck_1.checkSuspension, (0, validateRequest_1.default)(cart_validation_1.CartValidation.updateCartSingleValidation), cart_controller_1.CartController.updateCartSingle);
router.post('/updateCartMultiple/:productId', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.STAFF), organizationSuspenCheck_1.checkSuspension, (0, validateRequest_1.default)(cart_validation_1.CartValidation.updateCartMultipleValidation), cart_controller_1.CartController.updateCartMultiple);
router.patch('/removeItemsCart', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.STAFF), (0, validateRequest_1.default)(cart_validation_1.CartValidation.removeCartItemsValidation), cart_controller_1.CartController.removeProductFromCart);
router.get('/', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.STAFF), cart_controller_1.CartController.getMyCart);
router.get('/userCart/:userId', (0, auth_1.default)(user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.STAFF), cart_controller_1.CartController.getSingleUserCart);
exports.CartRoutes = router;
