import z from 'zod';

const createCategoryValidation = z.object({
  body: z.object({
    eng_name: z.string({ required_error: 'English category name is required' }),
    bn_name: z.string({ required_error: 'Bangla category name is required' }),
  }),
});

export const CategoryZodValidation = {
  createCategoryValidation,
};
