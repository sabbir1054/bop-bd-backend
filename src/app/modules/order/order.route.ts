import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { OrderController } from './order.controller';
import { OrderValidation } from './order.validation';

const router = express.Router();

router.post(
  '/create',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.STAFF,
  ),
  validateRequest(OrderValidation.orderCreateValidation),
  OrderController.orderCreate,
);

router.get(
  '/incomingOrders',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.STAFF,
  ),
  OrderController.getUserIncomingOrders,
);
router.get(
  '/incomingOrders/find',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.STAFF,
  ),
  OrderController.searchFilterIncomingOrders,
);
router.get(
  '/outgoingOrders',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.STAFF,
  ),
  OrderController.getUserOutgoingOrders,
);
router.get(
  '/outgoingOrders/find',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.STAFF,
  ),
  OrderController.searchFilterOutgoingOrders,
);

router.patch(
  '/updateOrderStatus/:orderId',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.STAFF,
  ),
  validateRequest(OrderValidation.updateOrderStatusValidation),
  OrderController.updateOrderStatus,
);
router.patch(
  '/updatePaymentStatus/:orderId',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.STAFF,
  ),
  validateRequest(OrderValidation.updatePaymentStatusValidation),
  OrderController.updatePaymentStatus,
);

router.get(
  '/:id',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.STAFF,
  ),
  OrderController.getSingle,
);

export const OrderRoutes = router;
