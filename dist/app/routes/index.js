"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const category_route_1 = require("../modules/Category/category.route");
const products_route_1 = require("../modules/Products/products.route");
const auth_route_1 = require("../modules/auth/auth.route");
const businessType_route_1 = require("../modules/businessType/businessType.route");
const cart_routes_1 = require("../modules/cart/cart.routes");
const feedback_routes_1 = require("../modules/feedback/feedback.routes");
const order_route_1 = require("../modules/order/order.route");
const organization_route_1 = require("../modules/organization/organization.route");
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
];
moduleRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
