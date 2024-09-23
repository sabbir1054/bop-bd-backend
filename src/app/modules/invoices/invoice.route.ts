import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { InvoiceController } from './invoice.controller';

const router = express.Router();

router.get(
  '/genarate/:orderId',
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
  InvoiceController.genaretInvoice,
);

export const InvoceRoutes = router;
