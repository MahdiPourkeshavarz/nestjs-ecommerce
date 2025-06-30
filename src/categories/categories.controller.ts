/* eslint-disable prettier/prettier */

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoriesService, FindAllResponse } from './categories.service';
import { Category } from './schema/categories.schema';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { UserRole } from '../auth/dto/auth-credentials.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<{ status: 'success'; data: { category } }> {
    const category = await this.categoriesService.create(createCategoryDto);
    return { status: 'success', data: { category } };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<{
    status: string;
    data: { categories: FindAllResponse };
  }> {
    const categories = await this.categoriesService.findAll();
    return { status: 'success', data: { categories } };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<{ status: 'success'; data: { category } }> {
    const category = await this.categoriesService.findOneById(id);
    return { status: 'success', data: { category } };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<{ status: string; data: { category: Category } }> {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    return { status: 'success', data: { category } };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(
    @Param('id') id: string,
  ): Promise<{ status: string; data: { category: Category } }> {
    const category = await this.categoriesService.remove(id);
    return { status: 'success', data: { category } };
  }
}
