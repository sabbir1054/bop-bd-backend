import z from 'zod';
import { membershipCategory } from '../Commission/commission.constant';

const createDeadlinePaycommissionValidation = z.object({
  body: z.object({
    memberCategory: z.enum([...membershipCategory] as [string, ...string[]], {
      required_error: 'Membership category is required',
    }),
    deadline: z.string({ required_error: 'Deadline is required' }),
  }),
});
const updateDeadlinePaycommissionValidation = z.object({
  body: z.object({
    memberCategory: z
      .enum([...membershipCategory] as [string, ...string[]], {
        required_error: 'Membership category is required',
      })
      .optional(),
    deadline: z.string({ required_error: 'Deadline is required' }).optional(),
  }),
});

export const DeadlinePayCommissionValidation = {
  createDeadlinePaycommissionValidation,
  updateDeadlinePaycommissionValidation,
};
