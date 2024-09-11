"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointsValueRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const reward_validation_1 = require("../reward/reward.validation");
const pointsValue_controller_1 = require("./pointsValue.controller");
const router = express_1.default.Router();
router.post('/create', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), pointsValue_controller_1.PointsValueController.createValueOfReward);
router.patch('/update', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), (0, validateRequest_1.default)(reward_validation_1.RewardPointsZodValidation.updateRewardValidation), pointsValue_controller_1.PointsValueController.editPointsValue);
router.delete('/delete', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), pointsValue_controller_1.PointsValueController.deletePointsValue);
router.get('/', pointsValue_controller_1.PointsValueController.getValueOfReward);
exports.PointsValueRoutes = router;
