import z from 'zod';

const createReferredCodeValidation = z.object({
  body: z.object({
    codeOwnerorganizationId: z.string({
      required_error: 'Code owned organization id is required',
    }),
  }),
});
const updateReferredCodeValidation = z.object({
  body: z.object({
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
