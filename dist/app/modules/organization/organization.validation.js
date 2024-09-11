"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const getOrderByDate = zod_1.default.object({
    body: zod_1.default.object({
        startDate: zod_1.default.string({ required_error: 'Start date is required' }),
        endDate: zod_1.default.string({ required_error: 'End date is required' }),
    }),
});
exports.OrganizationValidation = {
    getOrderByDate,
};
