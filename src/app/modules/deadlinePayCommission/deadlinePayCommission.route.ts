import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { DeadlinePayCommissionController } from './deadlinePayCommission.controller';

const router = express.Router();

router.post(
  '/create',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DeadlinePayCommissionController.create,
);
router.get('/', DeadlinePayCommissionController.getAll);
router.patch(
  '/update',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DeadlinePayCommissionController.updatedSingle,
);
router.delete(
  '/delete',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DeadlinePayCommissionController.deleteSingle,
);

export const DeadlinePayCommissionRoutes = router;
