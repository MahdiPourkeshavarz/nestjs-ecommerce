/* eslint-disable prettier/prettier */

import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Rating } from '../schema/rating.schema';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'category id is important' })
  category: string;

  @IsString()
  @IsNotEmpty({ message: 'subcategory id is important' })
  subcategory: string;

  @IsString()
  @MinLength(2, { message: 'product name should be at least 2 character' })
  @MaxLength(70, { message: 'name too long!' })
  name: string;

  @IsString()
  @IsOptional()
  slugname: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  discount: number;

  @IsString()
  @MinLength(2, { message: 'product name should be at least 2 character' })
  @MaxLength(70, { message: 'name too long!' })
  brand: string;

  @IsString()
  description: string;

  @IsObject()
  @IsOptional()
  rating: Rating;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  thumbnail?: string;
}
