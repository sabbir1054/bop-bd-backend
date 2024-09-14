import z from 'zod';

const createBusinessTypeValidation = z.object({
  body: z.object({
    typeName: z.string({
      required_error: 'Type name is required name is required',
    }),
    typeName_bn: z.string({
      required_error: 'Type name in bangla is required name is required',
    }),
  }),
});
const updateBusinessTypeValidation = z.object({
  body: z.object({
    typeName: z
      .string({
        required_error: 'Type name is required name is required',
      })
      .optional(),
    typeName_bn: z
      .string({
        required_error: 'Type name in bangla is required name is required',
      })
      .optional(),
  }),
});

export const BusinessTypeZodValidation = {
  createBusinessTypeValidation,
  updateBusinessTypeValidation,
};
