"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const staff_controller_1 = require("./staff.controller");
const router = express_1.default.Router();
router.get('/getAll', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.WHOLESALER), staff_controller_1.StaffController.getAll);
router.get('/getStaff/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.WHOLESALER), staff_controller_1.StaffController.getSingle);
router.patch('/blockStaff/:staffId', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.STAFF), staff_controller_1.StaffController.blockstaff);
exports.StaffRoutes = router;
