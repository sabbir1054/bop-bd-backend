import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { RewardController } from './reward.controller';
import { RewardPointsZodValidation } from './reward.validation';

const router = express.Router();

export const RewardRoutes = router;

router.post(
  '/create',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(RewardPointsZodValidation.createRewardValidation),
  RewardController.createNew,
);

router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(RewardPointsZodValidation.updateRewardValidation),
  RewardController.updateSingle,
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  RewardController.deleteSingle,
);

router.get(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  RewardController.getSingle,
);
router.get(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  RewardController.getAll,
);

/* 
createValueOfReward,
  getValueOfReward,
  editPointsValue,
  deletePointsValue,

*/
