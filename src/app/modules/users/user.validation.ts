import z from 'zod';
import { memberCategory } from './user.constant';

const updateUserProfileValidation = z.object({
  memberCategory: z
    .enum([...memberCategory] as [string, ...string[]])
    .optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  license: z.string().optional(),
  nid: z.string().optional(),
  businessTypeId: z.string().optional(),
  shop_name: z.string().optional(),
});

export const UsersValidation = {
  updateUserProfileValidation,
};
