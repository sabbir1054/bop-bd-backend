import z from 'zod';

const createCategoryValidation = z.object({
  eng_name: z.string({ required_error: 'English category name is required' }),
  bn_name: z.string({ required_error: 'Bangla category name is required' }),
  businessTypeId: z.string({ required_error: 'Business type i required' }),
  photo: z.string().optional(),
});
const updateCategoryValidation = z.object({
  body: z.object({
    eng_name: z.string().optional(),
    bn_name: z.string().optional(),
  }),
});

export const CategoryZodValidation = {
  createCategoryValidation,
  updateCategoryValidation,
};
