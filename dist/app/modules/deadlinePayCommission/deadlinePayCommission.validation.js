"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeadlinePayCommissionValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const commission_constant_1 = require("../Commission/commission.constant");
const createDeadlinePaycommissionValidation = zod_1.default.object({
    body: zod_1.default.object({
        memberCategory: zod_1.default.enum([...commission_constant_1.membershipCategory], {
            required_error: 'Membership category is required',
        }),
        deadline: zod_1.default.string({ required_error: 'Deadline is required' }),
    }),
});
const updateDeadlinePaycommissionValidation = zod_1.default.object({
    body: zod_1.default.object({
        memberCategory: zod_1.default
            .enum([...commission_constant_1.membershipCategory], {
            required_error: 'Membership category is required',
        })
            .optional(),
        deadline: zod_1.default.string({ required_error: 'Deadline is required' }).optional(),
    }),
});
// const requestExtendDeadlineValidation = z.object({
//   body: z.object({
//     organizationId: z.string({ required_error: 'Organization id is required' }),
//   }),
// });
exports.DeadlinePayCommissionValidation = {
    createDeadlinePaycommissionValidation,
    updateDeadlinePaycommissionValidation,
};
