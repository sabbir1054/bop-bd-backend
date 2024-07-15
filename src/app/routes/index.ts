import express from 'express';
import { CategoryRoutes } from '../modules/Category/category.route';
import { ProductRoutes } from '../modules/Products/products.route';
import { AuthRoutes } from '../modules/auth/auth.route';
import { BusinessTypeRoutes } from '../modules/businessType/businessType.route';
import { CartRoutes } from '../modules/cart/cart.routes';
import { FeedbackRoutes } from '../modules/feedback/feedback.routes';
import { OrderRoutes } from '../modules/order/order.route';
import { OrganizationRoutes } from '../modules/organization/organization.route';
import { UsersRoutes } from '../modules/users/users.route';

const router = express.Router();

const moduleRoutes = [
  // ... routes
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/businessType',
    route: BusinessTypeRoutes,
  },
  {
    path: '/category',
    route: CategoryRoutes,
  },
  {
    path: '/products',
    route: ProductRoutes,
  },
  {
    path: '/users',
    route: UsersRoutes,
  },
  {
    path: '/cart',
    route: CartRoutes,
  },
  {
    path: '/order',
    route: OrderRoutes,
  },
  {
    path: '/feedback',
    route: FeedbackRoutes,
  },
  {
    path: '/organization',
    route: OrganizationRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
