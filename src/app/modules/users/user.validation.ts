import z from 'zod';
import { memberCategory, StaffRole } from './user.constant';

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
const userVerifiedStatusChangeValidation = z.object({
  body: z.object({
    status: z.boolean({ required_error: 'Status is required' }),
    userId: z.string({ required_error: 'User id is required' }),
  }),
});

const getStaffValidation = z.object({
  body: z.object({
    staffInfo: z.enum([...StaffRole] as [string, ...string[]]).optional(),
  }),
});
const staffUpdateRoleValidation = z.object({
  body: z.object({
    staffId: z.string({ required_error: 'Stuff id is required' }),
    updatedRole: z.enum([...StaffRole] as [string, ...string[]]).optional(),
  }),
});

export const UsersValidation = {
  updateUserProfileValidation,
  userVerifiedStatusChangeValidation,
  getStaffValidation,
  staffUpdateRoleValidation,
};
