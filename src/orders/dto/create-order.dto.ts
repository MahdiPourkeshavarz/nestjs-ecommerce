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

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  user: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  readonly products: ProductInOrderDto[];

  @IsDate()
  @IsOptional()
  deliveryDate: Date;

  @IsBoolean()
  @IsOptional()
  deliveryStatus: boolean;
}
