import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { AdminController } from './admin.controller';

const router = express.Router();

router.get(
  '/getAllComssionInfo',
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.BOPCommissionInfo,
);
router.get(
  '/getAllUsersSummary',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.BOPuserInfo,
);
router.get(
  '/cashTransactionHistory',
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.cashTransactionHistory,
);
router.get(
  '/claimedRewardHistory',
  auth(ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.claimedRewardTransactionHistory,
);
router.get(
  '/smsBalanceCheck',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  AdminController.smsBalanceCheck,
);

export const AdminRoutes = router;
