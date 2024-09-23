"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const category_route_1 = require("../modules/Category/category.route");
const commission_route_1 = require("../modules/Commission/commission.route");
const products_route_1 = require("../modules/Products/products.route");
const referredCode_route_1 = require("../modules/ReferredCode/referredCode.route");
const admin_route_1 = require("../modules/admin/admin.route");
const auth_route_1 = require("../modules/auth/auth.route");
const businessType_route_1 = require("../modules/businessType/businessType.route");
const cart_routes_1 = require("../modules/cart/cart.routes");
const feedback_routes_1 = require("../modules/feedback/feedback.routes");
const invoice_route_1 = require("../modules/invoices/invoice.route");
const order_route_1 = require("../modules/order/order.route");
const organization_route_1 = require("../modules/organization/organization.route");
const paymentOptions_route_1 = require("../modules/paymentOptions/paymentOptions.route");
const referCodeValidDays_route_1 = require("../modules/refeCodeValidDays/referCodeValidDays.route");
const reward_route_1 = require("../modules/reward/reward.route");
const pointsValue_route_1 = require("../modules/rewardPointsValue/pointsValue.route");
const staff_route_1 = require("../modules/staff/staff.route");
const users_route_1 = require("../modules/users/users.route");
const router = express_1.default.Router();
const moduleRoutes = [
    // ... routes
    {
        path: '/auth',
        route: auth_route_1.AuthRoutes,
    },
    {
        path: '/businessType',
        route: businessType_route_1.BusinessTypeRoutes,
    },
    {
        path: '/category',
        route: category_route_1.CategoryRoutes,
    },
    {
        path: '/products',
        route: products_route_1.ProductRoutes,
    },
    {
        path: '/users',
        route: users_route_1.UsersRoutes,
    },
    {
        path: '/cart',
        route: cart_routes_1.CartRoutes,
    },
    {
        path: '/order',
        route: order_route_1.OrderRoutes,
    },
    {
        path: '/feedback',
        route: feedback_routes_1.FeedbackRoutes,
    },
    {
        path: '/organization',
        route: organization_route_1.OrganizationRoutes,
    },
    {
        path: '/staff',
        route: staff_route_1.StaffRoutes,
    },
    {
        path: '/my_admin',
        route: admin_route_1.AdminRoutes,
    },
    {
        path: '/commission',
        route: commission_route_1.CommissionRoutes,
    },
    {
        path: '/rewards',
        route: reward_route_1.RewardRoutes,
    },
    {
        path: '/referredCode',
        route: referredCode_route_1.ReferredCodeRoutes,
    },
    {
        path: '/points_value',
        route: pointsValue_route_1.PointsValueRoutes,
    },
    {
        path: '/validDays',
        route: referCodeValidDays_route_1.ValidDaysRoutes,
    },
    {
        path: '/paymentOptions',
        route: paymentOptions_route_1.PaymentOptionsRoutes,
    },
    {
        path: '/invoice',
        route: invoice_route_1.InvoceRoutes,
    },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
