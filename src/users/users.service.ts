/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User, UserDocument } from './schema/users.schema';
import { UsersRepository } from './users.repository';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthCredentialsSignupDto } from 'src/auth/dto/auth-credentials.dto';

export interface PaginatedUsersResult {
  status: string;
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: { users: User[] };
}

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: AuthCredentialsSignupDto): Promise<User> {
    const { username, phoneNumber } = createUserDto;

    const normalizedUsername = username.toLowerCase();
    if (await this.usersRepository.exists({ username: normalizedUsername })) {
      throw new ConflictException(
        'Username is already taken. Choose a different username.',
      );
    }
    if (await this.usersRepository.exists({ phoneNumber })) {
      throw new ConflictException('Phone number already exists.');
    }

    try {
      const userToCreate = { ...createUserDto, username: normalizedUsername };
      const savedUserDoc = await this.usersRepository.create(userToCreate);

      const userObject = savedUserDoc.toObject();

      const { password, ...result } = userObject;
      return result as User;
    } catch (error) {
      console.error('Error during user creation in service:', error);
      if (error.code === 11000 || error.message.includes('duplicate key')) {
        throw new ConflictException(
          'A user with the given details already exists.',
        );
      }
      throw new InternalServerErrorException('Could not create user.');
    }
  }

  async findAll(queryDto: QueryUserDto): Promise<PaginatedUsersResult> {
    const { users, total } = await this.usersRepository.findAll(queryDto);
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const totalPages = Math.ceil(total / limit);

    const sanitizedUsers = users.map((userDoc) => {
      const { password, refreshToken, ...result } = userDoc.toObject();
      return result;
    });

    return {
      status: 'success',
      page: Number(page),
      per_page: Number(limit),
      total,
      total_pages: totalPages,
      data: { users: sanitizedUsers as User[] },
    };
  }

  async findOne(id: string): Promise<User> {
    const userDoc = await this.usersRepository.findById(id);
    if (!userDoc) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    const { password, refreshToken, ...result } = userDoc.toObject();
    return result as User;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const userToUpdate = await this.usersRepository.findById(id, '+password');
    if (!userToUpdate) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const normalizedUpdateUsername = updateUserDto.username?.toLowerCase();

    if (
      normalizedUpdateUsername &&
      normalizedUpdateUsername !== userToUpdate.username
    ) {
      if (
        await this.usersRepository.exists({
          username: normalizedUpdateUsername,
        })
      ) {
        throw new ConflictException(
          'Username is already taken. Choose a different username.',
        );
      }
    }

    if (
      updateUserDto.phoneNumber &&
      updateUserDto.phoneNumber !== userToUpdate.phoneNumber
    ) {
      if (
        await this.usersRepository.exists({
          phoneNumber: updateUserDto.phoneNumber,
        })
      ) {
        throw new ConflictException('Phone number already exists.');
      }
    }

    const dtoToUpdate = normalizedUpdateUsername
      ? { ...updateUserDto, username: normalizedUpdateUsername }
      : updateUserDto;

    const updatedUserDoc = await this.usersRepository.findByIdAndUpdate(
      id,
      dtoToUpdate,
    );
    if (!updatedUserDoc) {
      throw new NotFoundException(
        `User with ID "${id}" not found after update attempt.`,
      );
    }

    const { password, ...result } = updatedUserDoc.toObject();
    return result as User;
  }

  async remove(id: string): Promise<User> {
    const userDoc = await this.usersRepository.findByIdAndDelete(id);
    if (!userDoc) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    const { password, refreshToken, ...result } = userDoc.toObject();
    return result as User;
  }

  async findByUsername(username: string): Promise<User> {
    const sanitizedUsername = username.toLocaleLowerCase();
    const userDoc =
      await this.usersRepository.findByUsername(sanitizedUsername);
    return userDoc;
  }

  async updateUserRefreshToken(
    userId: string,
    refreshTokenValue: string | null,
  ): Promise<void> {
    let hashedRefreshToken: string | null = null;
    if (refreshTokenValue) {
      const salt = await bcrypt.genSalt(10);
      hashedRefreshToken = await bcrypt.hash(refreshTokenValue, salt);
    }
    await this.usersRepository.updateUserRefreshToken(
      userId,
      hashedRefreshToken,
    );
  }

  async getUserIfRefreshTokenMatches(
    refreshTokenValue: string,
    userId: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersRepository.findById(userId, '+refreshToken');
    if (!user || !user.refreshToken) {
      return null;
    }

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshTokenValue,
      user.refreshToken,
    );
    return isRefreshTokenMatching ? user : null;
  }

  async ensureAdminExists(): Promise<void> {
    const adminRole = 'ADMIN';
    const adminUsername = this.configService
      .get<string>('ADMIN_USERNAME', 'superadmin')
      .toLowerCase();

    const adminExists = await this.usersRepository.exists({
      role: adminRole,
      username: adminUsername,
    });
    if (adminExists) {
      console.info(`[i] Admin user (${adminUsername}) already exists`);
      return;
    }

    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
    if (!adminPassword) {
      console.error('[!] ADMIN_PASSWORD is not set. Cannot create admin user.');
      return;
    }

    try {
      const adminData: AuthCredentialsSignupDto = {
        firstname: this.configService.get<string>('ADMIN_FIRSTNAME', 'admin'),
        lastname: this.configService.get<string>('ADMIN_LASTNAME', 'admin'),
        username: adminUsername,
        password: adminPassword,
        phoneNumber: this.configService.get<string>(
          'ADMIN_PHONE_NUMBER',
          '09122211111',
        ),
        address: this.configService.get<string>(
          'ADMIN_ADDRESS',
          'Tehran-tehran',
        ),
        wishlist: JSON.parse(
          this.configService.get<string>('admin.wishlist', '[]'),
        ),
        role: adminRole as any,
      };
      await this.usersRepository.create(adminData);
      console.log(`[+] Admin user (${adminUsername}) added`);
    } catch (error) {
      console.error(`Failed to create admin user (${adminUsername}):`, error);
    }
  }

  async removeRefreshToken(userId: string): Promise<void> {
    await this.usersRepository.updateHashedRefreshToken(userId, null);
  }
}
