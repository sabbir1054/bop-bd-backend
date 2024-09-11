"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidDaysRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const referCodeValidDays_controller_1 = require("./referCodeValidDays.controller");
const router = express_1.default.Router();
router.post('/create', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), referCodeValidDays_controller_1.ReferCodeValidityController.createNew);
router.patch('/', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), referCodeValidDays_controller_1.ReferCodeValidityController.updateSingle);
router.delete('/', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), referCodeValidDays_controller_1.ReferCodeValidityController.deleteSingle);
router.get('/', referCodeValidDays_controller_1.ReferCodeValidityController.getAll);
exports.ValidDaysRoutes = router;
