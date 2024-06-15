import express from 'express';
import { CategoryRoutes } from '../modules/Category/category.route';
import { ProductRoutes } from '../modules/Products/products.route';
import { AuthRoutes } from '../modules/auth/auth.route';
import { UsersRoutes } from '../modules/users/users.route';

const router = express.Router();

const moduleRoutes = [
  // ... routes
  {
    path: '/auth',
    route: AuthRoutes,
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
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
