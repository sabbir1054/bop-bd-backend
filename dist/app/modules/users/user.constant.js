"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userFilterableFields = exports.userSearchableFields = exports.StaffRole = exports.memberCategory = void 0;
exports.memberCategory = [
    'SILVER',
    'GOLD',
    'PLATINUM',
    'NORMAL',
    'DIAMOND',
];
exports.StaffRole = [
    'ORDER_SUPERVISOR',
    'STAFF_ADMIN',
    'STORE_MANAGER',
    'DELIVERY_BOY',
    'ACCOUNTS_MANAGER',
    'PURCHASE_OFFICER',
];
exports.userSearchableFields = ['phone'];
exports.userFilterableFields = [
    'searchTerm',
    'verified',
    'isMobileVerified',
    'isEmailVerified',
    'isNidVerified',
];
