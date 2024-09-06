import z from 'zod';
import { commissionType, membershipCategory } from './commission.constant';

const commissionCreateValidation = z.object({
  body: z.object({
    commissionType: z.enum([...commissionType] as [string, ...string[]], {
      required_error: 'Commission type is required',
    }),
    percentage: z.number({ required_error: 'Percentage number is required' }),
    isValid: z.boolean({ required_error: 'Is valid filed is required' }),
    new_mem_validity: z.number().optional(),
    membershipCategory: z.enum(
      [...membershipCategory] as [string, ...string[]],
      { required_error: 'Membership category is required' },
    ),
  }),
});
const commissionUpdateValidation = z.object({
  body: z.object({
    commissionType: z
      .enum([...commissionType] as [string, ...string[]], {
        required_error: 'Commission type is required',
      })
      .optional(),
    percentage: z.number({ required_error: 'Percentage number is required' }),
    isValid: z
      .boolean({ required_error: 'Is valid filed is required' })
      .optional(),
    new_mem_validity: z.number().optional(),
    membershipCategory: z
      .enum([...membershipCategory] as [string, ...string[]], {
        required_error: 'Membership category is required',
      })
      .optional(),
  }),
});

export const CommissionZodValidation = {
  commissionCreateValidation,
  commissionUpdateValidation,
};
