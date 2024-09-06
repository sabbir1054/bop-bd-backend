import express from 'express';
import { RewardController } from './reward.controller';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
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

router.get('/:id', RewardController.getSingle);
router.get('/', RewardController.getAll);

/* 
createValueOfReward,
  getValueOfReward,
  editPointsValue,
  deletePointsValue,

*/

router.post(
  '/reward_create',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  RewardController.createValueOfReward,
);

router.patch(
  '/reward/getSingle',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(RewardPointsZodValidation.updateRewardValidation),
  RewardController.updateSingle,
);
router.delete(
  '/updatePoints',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  RewardController.deleteSingle,
);

router.get('/reward_point', RewardController.getAll);
