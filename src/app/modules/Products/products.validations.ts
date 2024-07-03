import z from 'zod';

const createProductValidation = z.object({
  name: z.string({ required_error: 'Product name is required' }),
  description: z.string().optional(),
  sku: z.string({ required_error: 'Product sku code is required' }),
  buying_price: z.number().optional(),
  price: z.number({ required_error: 'Product selling price is required' }),
  discount_price: z.number().optional(),
  stock: z.number({ required_error: 'Please enter the stock' }),
  categoryId: z.string({ required_error: 'Category id is required' }),
});

const updateProductInfoValidation = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    sku: z.string().optional(),
    buying_price: z.number().optional(),
    price: z.number().optional(),
    discount_price: z.number().optional(),
    stock: z.number().optional(),
    categoryId: z.string().optional(),
  }),
});

export const ProductsValidation = {
  createProductValidation,
  updateProductInfoValidation,
};
