/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

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
import { SubCategoriesService } from './subcategories.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { UserRole } from 'src/auth/dto/auth-credentials.dto';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { SubCategory } from './schema/subcategories.schema';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';
import { FindAllResponse } from './models/findAll-response.model';

@Controller('subcategories')
export class SubCategoriesController {
  constructor(private readonly subcategoriesService: SubCategoriesService) {}

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
    @Body() createSubCategoryDto: CreateSubCategoryDto,
  ): Promise<{ status: 'success'; data: { subcategory: SubCategory } }> {
    const subcategory =
      await this.subcategoriesService.create(createSubCategoryDto);
    return { status: 'success', data: { subcategory } };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<{
    status: string;
    data: { subcategories };
  }> {
    const subcategories: FindAllResponse =
      await this.subcategoriesService.findAll();
    return { status: 'success', data: { subcategories } };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<{ status: 'success'; data: { subcategory: SubCategory } }> {
    const subcategory = await this.subcategoriesService.findOneById(id);
    return { status: 'success', data: { subcategory } };
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
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
  ): Promise<{ status: string; data: { subcategory: SubCategory } }> {
    const subcategory = await this.subcategoriesService.update(
      id,
      updateSubCategoryDto,
    );
    return { status: 'success', data: { subcategory } };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(
    @Param('id') id: string,
  ): Promise<{ status: string; data: { subcategory: SubCategory } }> {
    const subcategory = await this.subcategoriesService.remove(id);
    return { status: 'success', data: { subcategory } };
  }
}
