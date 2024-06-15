export interface IUpdateProductInput {
  name?: string;
  description?: string;
  sku?: string;
  buying_price?: number;
  price?: number;
  discount_price?: number;
  stock?: number;
  categoryId?: string;
}
