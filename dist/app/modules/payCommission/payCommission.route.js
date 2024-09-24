"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayCommissionRoutes = void 0;
const express_1 = __importDefault(require("express"));
const payCommission_controller_1 = require("./payCommission.controller");
const router = express_1.default.Router();
router.post('/createPayment', payCommission_controller_1.PayCommissionController.createPayment);
router.post('/executePayment', payCommission_controller_1.PayCommissionController.executePaymentHit);
exports.PayCommissionRoutes = router;
//01782066094
//15711
//5597
