/* eslint-disable prettier/prettier */

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PaginatedUsersResult, UsersService } from './users.service';
import { User } from './schema/users.schema';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto, UserRole } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { AuthCredentialsSignupDto } from 'src/auth/dto/auth-credentials.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  async create(
    @Body() createUserDto: AuthCredentialsSignupDto,
  ): Promise<{ status: string; data: { user: User } }> {
    const user = await this.usersService.create(createUserDto);
    return { status: 'success', data: { user } };
  }

  @Post('/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async adminCreateUser(
    @Body() createUserDto: AuthCredentialsSignupDto,
  ): Promise<{ status: string; data: { user: User } }> {
    const user = await this.usersService.create(createUserDto);
    return { status: 'success', data: { user } };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  findAll(@Query() queryUserDto: QueryUserDto): Promise<PaginatedUsersResult> {
    return this.usersService.findAll(queryUserDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: string,
  ): Promise<{ status: string; data: { user: User } }> {
    const user = await this.usersService.findOne(id);
    return { status: 'success', data: { user } };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ status: string; data: { user: User } }> {
    const user = await this.usersService.update(id, updateUserDto);
    return { status: 'success', data: { user } };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(
    @Param('id') id: string,
  ): Promise<{ status: string; data: { user: User } }> {
    const user = await this.usersService.remove(id);
    return { status: 'success', data: { user } };
  }
}
