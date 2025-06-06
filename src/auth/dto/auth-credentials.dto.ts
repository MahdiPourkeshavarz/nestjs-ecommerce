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
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { WishlistItemDto } from 'src/users/dto/whishlist.dto';

const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{8,}$/;

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class AuthCredentialsSignupDto {
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
  @MinLength(8)
  @MaxLength(32)
  @Matches(passwordRegex, {
    message:
      'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.',
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

export class AuthCredentialsLoginDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(passwordRegex, {
    message:
      'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.',
  })
  password: string;
}
