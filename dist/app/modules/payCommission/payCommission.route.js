"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayCommissionRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const payCommission_controller_1 = require("./payCommission.controller");
const payCommission_validation_1 = require("./payCommission.validation");
const router = express_1.default.Router();
router.post('/createPayment', (0, auth_1.default)(user_1.ENUM_USER_ROLE.STAFF, user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.WHOLESALER), (0, validateRequest_1.default)(payCommission_validation_1.PayCommissionZodValidation.createPaymentValidation), payCommission_controller_1.PayCommissionController.createPayment);
router.post('/executePayment', payCommission_controller_1.PayCommissionController.executePaymentHit);
exports.PayCommissionRoutes = router;
