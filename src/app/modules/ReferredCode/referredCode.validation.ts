import z from 'zod';

const createReferredCodeValidation = z.object({
  body: z.object({
    validUntil: z.string({ required_error: 'Validity date is required' }),
    isValid: z.boolean({ required_error: 'Is valid required' }),
    commissionId: z.string({ required_error: 'Commission id is required' }),
    codeOwnerorganizationId: z.string({
      required_error: 'Code owned organization id is required',
    }),
  }),
});
const updateReferredCodeValidation = z.object({
  body: z.object({
    validUntil: z
      .string({ required_error: 'Validity date is required' })
      .optional(),
    isValid: z.boolean({ required_error: 'Is valid required' }).optional(),
    commissionId: z
      .string({ required_error: 'Commission id is required' })
      .optional(),
    codeOwnerorganizationId: z
      .string({
        required_error: 'Code owned organization id is required',
      })
      .optional(),
  }),
});

export const ReferredCodeValidation = {
  createReferredCodeValidation,
  updateReferredCodeValidation,
};
