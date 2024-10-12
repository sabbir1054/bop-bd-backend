"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const order_controller_1 = require("./order.controller");
const order_validation_1 = require("./order.validation");
const organizationSuspenCheck_1 = require("../../middlewares/organizationSuspenCheck");
const router = express_1.default.Router();
router.post('/create', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.STAFF), organizationSuspenCheck_1.checkSuspension, (0, validateRequest_1.default)(order_validation_1.OrderValidation.orderCreateValidation), order_controller_1.OrderController.orderCreate);
router.patch('/updateOrderPaymentOption', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.STAFF), (0, validateRequest_1.default)(order_validation_1.OrderValidation.updateOrderPaymentOption), order_controller_1.OrderController.updateOrderPaymentOptions);
router.get('/incomingOrders/organization/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), order_controller_1.OrderController.getOrganizationIncomingOrders);
router.get('/outgoingOrders/organization/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), order_controller_1.OrderController.getOrganizationOutgoingOrders);
router.get('/incomingOrders/find', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.STAFF), order_controller_1.OrderController.searchFilterIncomingOrders);
router.get('/outgoingOrders/find', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.STAFF), order_controller_1.OrderController.searchFilterOutgoingOrders);
router.patch('/updateOrderStatus/:orderId', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.STAFF), (0, validateRequest_1.default)(order_validation_1.OrderValidation.updateOrderStatusValidation), order_controller_1.OrderController.updateOrderStatus);
router.patch('/updatePaymentStatus/:orderId', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.STAFF), (0, validateRequest_1.default)(order_validation_1.OrderValidation.updatePaymentStatusValidation), order_controller_1.OrderController.updatePaymentStatus);
router.get('/forDelivery/list', (0, auth_1.default)(user_1.ENUM_USER_ROLE.STAFF), order_controller_1.OrderController.getMyOrderForDelivery);
router.get('/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN, user_1.ENUM_USER_ROLE.STAFF), order_controller_1.OrderController.getSingle);
router.post('/verifyDelivery', (0, auth_1.default)(user_1.ENUM_USER_ROLE.STAFF), order_controller_1.OrderController.verifyDeliveryOtp);
router.post('/assignDeliveryBoy', (0, validateRequest_1.default)(order_validation_1.OrderValidation.assignForDeliveryValidation), (0, auth_1.default)(user_1.ENUM_USER_ROLE.STAFF, user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.RESELLER), order_controller_1.OrderController.assigndForDelivery);
router.patch('/updateDeliveryCharge/:orderId', //body te deliverCharge dibe number
(0, validateRequest_1.default)(order_validation_1.OrderValidation.updateOrderDeliveryCharge), (0, auth_1.default)(user_1.ENUM_USER_ROLE.STAFF, user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.RESELLER), order_controller_1.OrderController.updateOrderDeliveryCharge);
exports.OrderRoutes = router;
