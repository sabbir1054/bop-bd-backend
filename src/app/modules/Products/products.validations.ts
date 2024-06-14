import z from 'zod';

const createProductValidation = z.object({
  name: z.string({ required_error: 'Product name is required' }),
  description: z.string().optional(),
  ownerId: z.string({ required_error: 'Owner id is required' }),
  sku: z.string({ required_error: 'Product sku code is required' }),
  buying_price: z.number().optional(),
  price: z.number({ required_error: 'Product selling price is required' }),
  discount_price: z.number().optional(),
  stock: z.number({ required_error: 'Please enter the stock' }),
  categoryId: z.string({ required_error: 'Category id is required' }),
});

// const createProductValidation = z.object({
//   body: z.object({
//     name: z.string({ required_error: 'Product name is required' }),
//     description: z.string().optional(),
//     ownerId: z.string({ required_error: 'Owner id is required' }),
//     sku: z.string({ required_error: 'Product sku code is required' }),
//     buying_price: z.number().optional(),
//     price: z.number({ required_error: 'Product selling price is required' }),
//     discount_price: z.number().optional(),
//     stock: z.number({ required_error: 'Please enter the stock' }),
//     categoryId: z.string({ required_error: 'Category id is required' }),
//   }),
// });

export const ProductsValidation = {
  createProductValidation,
};
