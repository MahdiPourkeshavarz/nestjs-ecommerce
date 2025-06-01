/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */

import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
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

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'first name is required' })
  @Type(() => String)
  firstname: string;

  @IsString()
  @IsNotEmpty({ message: 'last name is required' })
  @Type(() => String)
  lastname: string;

  @IsString()
  @IsNotEmpty({ message: 'username is required' })
  @IsLowercase({ message: 'username must be lowercase' })
  @Type(() => String)
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  @MinLength(8, { message: 'Password must have 8 or more characters' })
  @Matches(passwordRegex, {
    message: 'Password must have at least one letter and one digit',
  })
  password: string;

  @IsPhoneNumber('IR')
  @IsNotEmpty({ message: 'Phone number is required' })
  @Type(() => String)
  phoneNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  @Type(() => String)
  address: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WishlistItemDto)
  @IsOptional()
  wishlist: WishlistItemDto[];

  @IsEnum(UserRole, { message: 'Invalid role. Must be ADMIN or USER' })
  @IsOptional()
  @Type(() => String)
  role: UserRole;
}
