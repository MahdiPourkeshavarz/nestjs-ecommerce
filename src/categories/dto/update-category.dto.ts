/* eslint-disable prettier/prettier */

import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';
import { IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsString()
  @Type(() => String)
  id: string;
}
