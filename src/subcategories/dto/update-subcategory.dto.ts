/* eslint-disable prettier/prettier */

import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateSubCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'category id is important' })
  category: string;

  @IsString()
  @IsNotEmpty({ message: 'subcategory name is important' })
  @MinLength(2, { message: 'subcategory name must be at least 2 character' })
  @MaxLength(50, { message: 'too long!' })
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  slugname?: string;
}
