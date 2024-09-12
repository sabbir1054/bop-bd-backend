import express from 'express';
import { CategoryRoutes } from '../modules/Category/category.route';
import { ProductRoutes } from '../modules/Products/products.route';
import { AuthRoutes } from '../modules/auth/auth.route';
import { BusinessTypeRoutes } from '../modules/businessType/businessType.route';
import { CartRoutes } from '../modules/cart/cart.routes';
import { FeedbackRoutes } from '../modules/feedback/feedback.routes';
import { OrderRoutes } from '../modules/order/order.route';
import { OrganizationRoutes } from '../modules/organization/organization.route';
import { PaymentOptionsRoutes } from '../modules/paymentOptions/paymentOptions.route';
import { StaffRoutes } from '../modules/staff/staff.route';
import { UsersRoutes } from '../modules/users/users.route';
import { PointsValueRoutes } from '../modules/rewardPointsValue/pointsValue.route';
import { AdminRoutes } from '../modules/admin/admin.route';
import { CommissionRoutes } from '../modules/Commission/commission.route';
import { RewardRoutes } from '../modules/reward/reward.route';
import { ReferredCodeRoutes } from '../modules/ReferredCode/referredCode.route';
import { ValidDaysRoutes } from '../modules/refeCodeValidDays/referCodeValidDays.route';

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
  {
    path: '/staff',
    route: StaffRoutes,
  },
  {
    path: '/my_admin',
    route: AdminRoutes,
  },
  {
    path: '/commission',
    route: CommissionRoutes,
  },
  {
    path: '/rewards',
    route: RewardRoutes,
  },
  {
    path: '/referredCode',
    route: ReferredCodeRoutes,
  },
  {
    path: '/points_value',
    route: PointsValueRoutes,
  },
  {
    path: '/validDays',
    route: ValidDaysRoutes,
  },
  {
    path: '/paymentOptions',
    route: PaymentOptionsRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
