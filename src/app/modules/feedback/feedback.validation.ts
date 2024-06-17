import z from 'zod';

const createFeedbackValidation = z.object({
  body: z.object({
    rating: z.number({ required_error: 'Rating is required' }),
    comment: z.string({ required_error: 'Comment is required' }),
    userId: z.string({ required_error: 'User id is required' }),
    productId: z.string({ required_error: 'Product id is required' }),
  }),
});

export const FeedbackValidation = {
  createFeedbackValidation,
};
