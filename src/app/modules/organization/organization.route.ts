import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { OrganizationValidation } from './organization.validation';
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

router.post(
  '/incomingOrderByDate',
  validateRequest(OrganizationValidation.getOrderByDate),
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.STAFF,
    ENUM_USER_ROLE.WHOLESALER,
  ),
  OrganizationController.getIncomingOrdersByDate,
);
router.post(
  '/outgoingOrderByDate',
  validateRequest(OrganizationValidation.getOrderByDate),
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.STAFF,
    ENUM_USER_ROLE.WHOLESALER,
  ),
  OrganizationController.getOutgoingOrdersByDate,
);
export const OrganizationRoutes = router;
