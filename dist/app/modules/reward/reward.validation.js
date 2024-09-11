"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardPointsZodValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const commission_constant_1 = require("../Commission/commission.constant");
const reward_constant_1 = require("./reward.constant");
const createRewardValidation = zod_1.default.object({
    body: zod_1.default.object({
        rewardType: zod_1.default.enum([...reward_constant_1.rewardPointsType], {
            required_error: 'Reward point type is required',
        }),
        membershipCategory: zod_1.default.enum([...commission_constant_1.membershipCategory], {
            required_error: 'Membership category type is required',
        }),
        points: zod_1.default.number({ required_error: 'Points is required' }),
    }),
});
const updateRewardValidation = zod_1.default.object({
    body: zod_1.default.object({
        rewardType: zod_1.default
            .enum([...reward_constant_1.rewardPointsType], {
            required_error: 'Reward point type is required',
        })
            .optional(),
        membershipCategory: zod_1.default
            .enum([...commission_constant_1.membershipCategory], {
            required_error: 'Membership category type is required',
        })
            .optional(),
        points: zod_1.default.number({ required_error: 'Points is required' }).optional(),
    }),
});
exports.RewardPointsZodValidation = {
    createRewardValidation,
    updateRewardValidation,
};
