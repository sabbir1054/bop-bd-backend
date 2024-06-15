import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { CartController } from './cart.controller';

const router = express.Router();

router.post(
  '/addCartSingle/:productId',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.SELLER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
  ),
  CartController.addToCartSingle,
);

export const CartRoutes = router;
