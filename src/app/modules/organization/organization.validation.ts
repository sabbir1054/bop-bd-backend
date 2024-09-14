import z from 'zod';
import { memberCategory } from '../users/user.constant';

const getOrderByDate = z.object({
  body: z.object({
    startDate: z.string({ required_error: 'Start date is required' }),
    endDate: z.string({ required_error: 'End date is required' }),
  }),
});
const UpdateOrganizationNamePhotoValidation = z.object({
  name: z.string().optional(),
});
const UpdateOrganizationMembership = z.object({
  body: z.object({
    organizationId: z.string({ required_error: 'Organization id required' }),
    memberShipCategory: z.enum([...memberCategory] as [string, ...string[]], {
      required_error: 'Membership category is required',
    }),
  }),
});
export const OrganizationValidation = {
  getOrderByDate,
  UpdateOrganizationNamePhotoValidation,
  UpdateOrganizationMembership,
};
