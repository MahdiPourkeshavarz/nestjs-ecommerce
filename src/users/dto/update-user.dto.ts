/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */

import { Type } from 'class-transformer';
import {
  IsArray,
  IsLowercase,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { WishlistItemDto } from './whishlist.dto';

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)/;

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class UpdateUserDto {
  @IsString()
  @Type(() => String)
  id: string;

  @IsOptional()
  @IsString()
  @Type(() => String)
  firstname?: string;

  @IsOptional()
  @IsString()
  @Type(() => String)
  lastname?: string;

  @IsOptional()
  @IsString()
  @IsLowercase({ message: 'Username must be lowercase' })
  @Type(() => String)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must have 8 or more characters' })
  @Matches(passwordRegex, {
    message: 'Password must have at least one letter and one digit',
  })
  password?: string;

  @IsPhoneNumber('IR')
  @IsNotEmpty({ message: 'Phone number is required' })
  @Type(() => String)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @Type(() => String)
  address?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WishlistItemDto)
  wishlist?: WishlistItemDto[];
}
