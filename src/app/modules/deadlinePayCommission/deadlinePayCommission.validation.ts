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
// const requestExtendDeadlineValidation = z.object({
//   body: z.object({
//     organizationId: z.string({ required_error: 'Organization id is required' }),
//   }),
// });

export const DeadlinePayCommissionValidation = {
  createDeadlinePaycommissionValidation,
  updateDeadlinePaycommissionValidation,
};
