"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const user_constant_1 = require("../users/user.constant");
const getOrderByDate = zod_1.default.object({
    body: zod_1.default.object({
        startDate: zod_1.default.string({ required_error: 'Start date is required' }),
        endDate: zod_1.default.string({ required_error: 'End date is required' }),
    }),
});
const UpdateOrganizationNamePhotoValidation = zod_1.default.object({
    name: zod_1.default.string().optional(),
});
const UpdateOrganizationMembership = zod_1.default.object({
    body: zod_1.default.object({
        organizationId: zod_1.default.string({ required_error: 'Organization id required' }),
        memberShipCategory: zod_1.default.enum([...user_constant_1.memberCategory], {
            required_error: 'Membership category is required',
        }),
    }),
});
exports.OrganizationValidation = {
    getOrderByDate,
    UpdateOrganizationNamePhotoValidation,
    UpdateOrganizationMembership,
};
