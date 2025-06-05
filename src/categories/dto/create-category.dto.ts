/* eslint-disable prettier/prettier */

import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'category name is important' })
  @MinLength(2, { message: 'category name must be at least 2 character' })
  @MaxLength(50, { message: 'too long!' })
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  slugname?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
