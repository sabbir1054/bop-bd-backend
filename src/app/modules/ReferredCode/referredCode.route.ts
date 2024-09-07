import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { ReferredCodeController } from './referredCode.controller';

const router = express.Router();
router.get(
  '/all',
  auth(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.STAFF,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.WHOLESALER,
  ),
  ReferredCodeController.getAll,
);
router.get(
  '/:id',
  auth(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.STAFF,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.WHOLESALER,
  ),
  ReferredCodeController.getAll,
);
router.delete(
  '/:id',
  auth(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.STAFF,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.WHOLESALER,
  ),
  ReferredCodeController.deleteSingle,
);

router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ReferredCodeController.updateSingle,
);
export const ReferredCodeRoutes = router;
