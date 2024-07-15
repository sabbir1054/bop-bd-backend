import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { OrganizationController } from './organizations.controller';

const router = express.Router();

router.get(
  '/dashboardMatrics',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.STAFF,
    ENUM_USER_ROLE.WHOLESALER,
  ),
  OrganizationController.getDashboardMatrics,
);

export const OrganizationRoutes = router;
