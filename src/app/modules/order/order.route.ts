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

router.patch(
  '/updateOrderPaymentOption',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.STAFF,
  ),
  validateRequest(OrderValidation.updateOrderPaymentOption),
  OrderController.updateOrderPaymentOptions,
);

router.get(
  '/incomingOrders/organization/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  OrderController.getOrganizationIncomingOrders,
);
router.get(
  '/outgoingOrders/organization/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  OrderController.getOrganizationOutgoingOrders,
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
  '/forDelivery/list',
  auth(ENUM_USER_ROLE.STAFF),
  OrderController.getMyOrderForDelivery,
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

router.post(
  '/verifyDelivery',
  auth(ENUM_USER_ROLE.STAFF),
  OrderController.verifyDeliveryOtp,
);

router.post(
  '/assignDeliveryBoy',
  validateRequest(OrderValidation.assignForDeliveryValidation),
  auth(
    ENUM_USER_ROLE.STAFF,
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.RESELLER,
  ),
  OrderController.assigndForDelivery,
);
router.patch(
  '/updateDeliveryCharge/:orderID', //body te deliverCharge dibe number
  validateRequest(OrderValidation.updateOrderDeliveryCharge),
  auth(
    ENUM_USER_ROLE.STAFF,
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.RESELLER,
  ),
  OrderController.updateOrderDeliveryCharge,
);

export const OrderRoutes = router;
