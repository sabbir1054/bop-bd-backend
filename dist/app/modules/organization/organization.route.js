"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const organization_validation_1 = require("./organization.validation");
const organizations_controller_1 = require("./organizations.controller");
const router = express_1.default.Router();
router.get('/dashboardMatrics', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.STAFF, user_1.ENUM_USER_ROLE.WHOLESALER), organizations_controller_1.OrganizationController.getDashboardMatrics);
router.post('/incomingOrderByDate', (0, validateRequest_1.default)(organization_validation_1.OrganizationValidation.getOrderByDate), (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.STAFF, user_1.ENUM_USER_ROLE.WHOLESALER), organizations_controller_1.OrganizationController.getIncomingOrdersByDate);
router.post('/outgoingOrderByDate', (0, validateRequest_1.default)(organization_validation_1.OrganizationValidation.getOrderByDate), (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.STAFF, user_1.ENUM_USER_ROLE.WHOLESALER), organizations_controller_1.OrganizationController.getOutgoingOrdersByDate);
exports.OrganizationRoutes = router;
