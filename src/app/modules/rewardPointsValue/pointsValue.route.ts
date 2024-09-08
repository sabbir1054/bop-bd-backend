import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { RewardPointsZodValidation } from '../reward/reward.validation';
import { PointsValueController } from './pointsValue.controller';

const router = express.Router();

router.post(
  '/create',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  PointsValueController.createValueOfReward,
);

router.patch(
  '/update',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(RewardPointsZodValidation.updateRewardValidation),
  PointsValueController.editPointsValue,
);
router.delete(
  '/delete',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  PointsValueController.deletePointsValue,
);

router.get('/', PointsValueController.getValueOfReward);

export const PointsValueRoutes = router;
