import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserPaymentOptionsController } from './userPaymentOptions.controller';
import { UserPaymentOptionsValidation } from './userPaymentOptions.validation';

const router = express.Router();

router.post(
  '/create',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.STAFF,
    ENUM_USER_ROLE.WHOLESALER,
  ),
  validateRequest(UserPaymentOptionsValidation.createUserPaymentOptions),
  UserPaymentOptionsController.createPaymentOptions,
);
router.get(
  '/:organizationId',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.STAFF,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
  ),
  UserPaymentOptionsController.organizationAllPaymentOptions,
);
router.patch(
  '/:organizationId/:paymentSystemOptionsId',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.STAFF,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
  ),
  validateRequest(UserPaymentOptionsValidation.updateUserPaymentOptions),
  UserPaymentOptionsController.updateOrganizationPaymentOptions,
);
router.delete(
  '/:organizationId/:paymentSystemOptionsId',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.STAFF,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
  ),
  UserPaymentOptionsController.deleteorganizationPaymentOptions,
);
export const UserPaymentRoutes = router;
