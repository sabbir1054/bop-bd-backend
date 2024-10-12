"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeadlinePayCommissionRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const deadlinePayCommission_controller_1 = require("./deadlinePayCommission.controller");
const deadlinePayCommission_validation_1 = require("./deadlinePayCommission.validation");
const router = express_1.default.Router();
router.post('/create', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), (0, validateRequest_1.default)(deadlinePayCommission_validation_1.DeadlinePayCommissionValidation.createDeadlinePaycommissionValidation), deadlinePayCommission_controller_1.DeadlinePayCommissionController.create);
router.get('/', deadlinePayCommission_controller_1.DeadlinePayCommissionController.getAll);
router.get('/:id', deadlinePayCommission_controller_1.DeadlinePayCommissionController.getSingle);
router.patch('/update/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), (0, validateRequest_1.default)(deadlinePayCommission_validation_1.DeadlinePayCommissionValidation.updateDeadlinePaycommissionValidation), deadlinePayCommission_controller_1.DeadlinePayCommissionController.updatedSingle);
router.delete('/delete/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), deadlinePayCommission_controller_1.DeadlinePayCommissionController.deleteSingle);
//?-----------------
router.post('/extendRequest', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.STAFF, user_1.ENUM_USER_ROLE.WHOLESALER), deadlinePayCommission_controller_1.DeadlinePayCommissionController.extendDeadlineRequest);
router.patch('/handleRequest/:requestId', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), deadlinePayCommission_controller_1.DeadlinePayCommissionController.handleDeadlineRequest);
router.patch('/updateMyRequest/:requestId', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.STAFF, user_1.ENUM_USER_ROLE.WHOLESALER), deadlinePayCommission_controller_1.DeadlinePayCommissionController.updateMyRequest);
//* here admin get all organization request and other get own organization request
router.get('/request/getall', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.STAFF, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), deadlinePayCommission_controller_1.DeadlinePayCommissionController.getAllDeadlineExtendRequest);
//* here admin get all organization request details and
//* other get own organization request details
router.get('/extendDeadline/:requestId', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.STAFF, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), deadlinePayCommission_controller_1.DeadlinePayCommissionController.getSingleRequest);
exports.DeadlinePayCommissionRoutes = router;
