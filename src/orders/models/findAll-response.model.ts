/* eslint-disable prettier/prettier */

import { Order } from '../schema/orders.schema';

export interface FindAllResponse {
  status: 'success';
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: { orders: Order[] };
}
