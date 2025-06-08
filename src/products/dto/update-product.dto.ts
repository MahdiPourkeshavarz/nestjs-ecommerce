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

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'category id is important' })
  category: string;

  @IsString()
  @IsNotEmpty({ message: 'subcategory id is important' })
  subcategory: string;

  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'product name should be at least 2 character' })
  @MaxLength(70, { message: 'name too long!' })
  name: string;

  @IsNumber()
  @IsOptional()
  price: number;

  @IsNumber()
  @IsOptional()
  quantity: number;

  @IsNumber()
  @IsOptional()
  discount: number;

  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'product name should be at least 2 character' })
  @MaxLength(70, { message: 'name too long!' })
  brand: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsObject()
  @IsOptional()
  rating: Rating;

  @IsArray()
  @IsOptional()
  images: string[];

  @IsString()
  @IsOptional()
  thumbnail: string;
}
