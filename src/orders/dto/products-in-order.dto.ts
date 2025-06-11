/* eslint-disable prettier/prettier */

import { IsInt, IsMongoId, Min } from 'class-validator';

export class ProductInOrderDto {
  [x: string]: any;
  @IsMongoId()
  readonly product: string;

  @IsInt()
  @Min(1)
  readonly count: number;
}
