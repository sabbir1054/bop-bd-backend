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

export const UserPaymentRoutes = router;
