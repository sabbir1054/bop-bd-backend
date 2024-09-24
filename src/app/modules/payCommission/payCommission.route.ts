import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PayCommissionController } from './payCommission.controller';
import { PayCommissionZodValidation } from './payCommission.validation';

const router = express.Router();

router.post(
  '/createPayment',
  auth(
    ENUM_USER_ROLE.STAFF,
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.WHOLESALER,
  ),
  validateRequest(PayCommissionZodValidation.createPaymentValidation),
  PayCommissionController.createPayment,
);
router.post('/executePayment', PayCommissionController.executePaymentHit);
router.post(
  '/payCommissionHistory',
  auth(
    ENUM_USER_ROLE.STAFF,
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.WHOLESALER,
  ),
  PayCommissionController.getOrganizationPayCommissionHistory,
);

export const PayCommissionRoutes = router;
