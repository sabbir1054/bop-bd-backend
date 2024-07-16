import z from 'zod';

const createFeedbackValidation = z.object({
  body: z.object({
    rating: z
      .number({ required_error: 'Rating is required' })
      .max(5, { message: 'Rating cannot be more than 5' }),
    comment: z.string({ required_error: 'Comment is required' }),
    productId: z.string({ required_error: 'Product id is required' }),
  }),
});
const updateFeedbackValidation = z.object({
  body: z.object({
    rating: z
      .number({ required_error: 'Rating is required' })
      .max(5, { message: 'Rating cannot be more than 5' })
      .optional(),
    comment: z.string({ required_error: 'Comment is required' }).optional(),
  }),
});

export const FeedbackValidation = {
  createFeedbackValidation,
  updateFeedbackValidation,
};
