import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { StaffController } from './staff.controller';

const router = express.Router();

router.get(
  '/getAll',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.WHOLESALER,
  ),
  StaffController.getAll,
);
router.get(
  '/getStaff/:id',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.WHOLESALER,
  ),
  StaffController.getSingle,
);
router.patch(
  '/blockStaff/:staffId',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.STAFF,
  ),
  StaffController.blockstaff,
);
router.patch(
  '/unBlockStaff/:staffId',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.STAFF,
  ),
  StaffController.blockstaff,
);

export const StaffRoutes = router;
