/* eslint-disable prettier/prettier */

import { SubCategory } from '../schema/subcategories.schema';

export interface FindAllResponse {
  status: 'success';
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: { subcategories: SubCategory[] };
}
