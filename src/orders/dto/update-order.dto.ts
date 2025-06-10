/* eslint-disable prettier/prettier */

import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ProductInOrderDto } from './products-in-order.dto';

export class UpdateOrderDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  user: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @IsOptional()
  readonly products: ProductInOrderDto[];

  @IsDate()
  @IsOptional()
  deliveryDate: Date;

  @IsBoolean()
  @IsOptional()
  deliveryStatus: boolean;
}
