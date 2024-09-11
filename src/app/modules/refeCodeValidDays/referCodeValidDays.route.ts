import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { ReferCodeValidityController } from './referCodeValidDays.controller';

const router = express.Router();

router.post(
  '/create',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ReferCodeValidityController.createNew,
);

router.patch(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ReferCodeValidityController.updateSingle,
);
router.delete(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ReferCodeValidityController.deleteSingle,
);
router.get('/', ReferCodeValidityController.getAll);

export const ValidDaysRoutes = router;
