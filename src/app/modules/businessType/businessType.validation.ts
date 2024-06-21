import z from 'zod';

const createBusinessTypeValidation = z.object({
  body: z.object({
    typeName: z.string({
      required_error: 'Type name is required name is required',
    }),
  }),
});
const updateBusinessTypeValidation = z.object({
  body: z.object({
    typeName: z.string({
      required_error: 'Type name is required name is required',
    }),
  }),
});

export const BusinessTypeZodValidation = {
  createBusinessTypeValidation,
  updateBusinessTypeValidation,
};
