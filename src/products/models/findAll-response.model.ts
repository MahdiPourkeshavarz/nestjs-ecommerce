/* eslint-disable prettier/prettier */

import { Product } from '../schema/products.schema';

export interface FindAllResponse {
  status: 'success';
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: { products: Product[] };
}
