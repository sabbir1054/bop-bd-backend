"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validStaffRoleForOrderStatusUpdate = exports.ordersSearchableFieldsAdmin = exports.ordersFilterableFields = exports.ordersSearchableFields = exports.PaymentStatusConstant = exports.OrderStatusConstant = void 0;
exports.OrderStatusConstant = [
    'PENDING',
    'ACCEPTED',
    'CANCEL',
    'SHIPPING',
    'DELIVERED',
];
exports.PaymentStatusConstant = ['PENDING', 'PAID'];
exports.ordersSearchableFields = ['orderCode'];
exports.ordersFilterableFields = [
    'searchTerm',
    'orderStatus',
    'paymentStatus',
];
exports.ordersSearchableFieldsAdmin = ['category'];
exports.validStaffRoleForOrderStatusUpdate = [
    'ORDER_SUPERVISOR',
    'STAFF_ADMIN',
    'DELIVERY_BOY',
];
