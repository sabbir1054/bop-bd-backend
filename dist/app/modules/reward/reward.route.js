"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const reward_controller_1 = require("./reward.controller");
const reward_validation_1 = require("./reward.validation");
const router = express_1.default.Router();
exports.RewardRoutes = router;
router.post('/create', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), (0, validateRequest_1.default)(reward_validation_1.RewardPointsZodValidation.createRewardValidation), reward_controller_1.RewardController.createNew);
router.patch('/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), (0, validateRequest_1.default)(reward_validation_1.RewardPointsZodValidation.updateRewardValidation), reward_controller_1.RewardController.updateSingle);
router.delete('/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), reward_controller_1.RewardController.deleteSingle);
router.get('/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), reward_controller_1.RewardController.getSingle);
router.get('/', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), reward_controller_1.RewardController.getAll);
/*
createValueOfReward,
  getValueOfReward,
  editPointsValue,
  deletePointsValue,

*/
