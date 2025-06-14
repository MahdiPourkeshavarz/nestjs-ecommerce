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
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  user: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProductInOrderDto)
  readonly products: ProductInOrderDto[];

  @IsDate()
  @IsOptional()
  deliveryDate: Date;

  @IsBoolean()
  @IsOptional()
  deliveryStatus: boolean;
}
