import z from 'zod';
import { membershipCategory } from '../Commission/commission.constant';
import { rewardPointsType } from './reward.constant';

const createRewardValidation = z.object({
  body: z.object({
    rewardType: z.enum([...rewardPointsType] as [string, ...string[]], {
      required_error: 'Reward point type is required',
    }),
    membershipCategory: z.enum(
      [...membershipCategory] as [string, ...string[]],
      {
        required_error: 'Membership category type is required',
      },
    ),
    points: z.number({ required_error: 'Points is required' }),
  }),
});
const updateRewardValidation = z.object({
  body: z.object({
    rewardType: z
      .enum([...rewardPointsType] as [string, ...string[]], {
        required_error: 'Reward point type is required',
      })
      .optional(),
    membershipCategory: z
      .enum([...membershipCategory] as [string, ...string[]], {
        required_error: 'Membership category type is required',
      })
      .optional(),
    points: z.number({ required_error: 'Points is required' }).optional(),
  }),
});

export const RewardPointsZodValidation = {
  createRewardValidation,
  updateRewardValidation,
};
