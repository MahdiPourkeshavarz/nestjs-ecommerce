/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from './schema/users.schema';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';

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

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, phoneNumber } = createUserDto;

    if (await this.usersRepository.exists({ username })) {
      throw new ConflictException(
        'Username is already taken. Choose a different username.',
      );
    }
    if (await this.usersRepository.exists({ phoneNumber })) {
      throw new ConflictException('Phone number already exists.');
    }

    try {
      const savedUser = await this.usersRepository.create(createUserDto);
      const { password, refreshToken, ...result } = savedUser.toObject();
      return result as User;
    } catch (error) {
      throw new InternalServerErrorException('Could not create user.');
    }
  }

  async findAll(queryDto: QueryUserDto): Promise<PaginatedUsersResult> {
    const { users, total } = await this.usersRepository.findAll(queryDto);
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const totalPages = Math.ceil(total / limit);

    const sanitizedUsers = users.map((user) => {
      const { password, refreshToken, ...result } = user.toObject();
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
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    const { password, refreshToken, ...result } = user.toObject();
    return result as User;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const userToUpdate = await this.usersRepository.findById(id, '+password');
    if (!userToUpdate) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    if (
      updateUserDto.username &&
      updateUserDto.username !== userToUpdate.username
    ) {
      if (
        await this.usersRepository.exists({ username: updateUserDto.username })
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

    const updatedUser = await this.usersRepository.findByIdAndUpdate(
      id,
      updateUserDto,
    );
    if (!updatedUser) {
      throw new NotFoundException(
        `User with ID "${id}" not found after update attempt.`,
      );
    }

    const { password, refreshToken, ...result } = updatedUser.toObject();
    return result as User;
  }

  async remove(id: string): Promise<User> {
    const user = await this.usersRepository.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    const { password, refreshToken, ...result } = user.toObject();
    return result as User;
  }

  async ensureAdminExists(): Promise<void> {
    const adminExists = await this.usersRepository.exists({ role: 'ADMIN' });
    if (adminExists) {
      console.info('[i] Admin user already exists');
      return;
    }
    try {
      await this.usersRepository.create({
        firstname: this.configService.get<string>('admin.firstname', 'Admin'),
        lastname: this.configService.get<string>('admin.lastname', 'User'),
        username: this.configService.get<string>(
          'admin.username',
          'superadmin',
        ),
        password: this.configService.get<string>('admin.password'),
        phoneNumber: this.configService.get<string>(
          'admin.phoneNumber',
          '00000000000',
        ),
        address: this.configService.get<string>(
          'admin.phoneNumber',
          '00000000000',
        ),
        wishlist: JSON.parse(
          this.configService.get<string>('admin.wishlist', '[]'),
        ),
        role: 'ADMIN',
      } as CreateUserDto);
      console.log('[+] Admin user added');
    } catch (error) {
      console.error('Failed to create admin user:', error);
    }
  }
}
