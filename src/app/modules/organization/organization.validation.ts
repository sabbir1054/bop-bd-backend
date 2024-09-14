import z from 'zod';

const getOrderByDate = z.object({
  body: z.object({
    startDate: z.string({ required_error: 'Start date is required' }),
    endDate: z.string({ required_error: 'End date is required' }),
  }),
});
const UpdateOrganizationNamePhotoValidation = z.object({
  name: z.string().optional(),
});
export const OrganizationValidation = {
  getOrderByDate,
  UpdateOrganizationNamePhotoValidation,
};
