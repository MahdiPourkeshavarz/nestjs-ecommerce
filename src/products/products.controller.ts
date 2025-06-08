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
import { ProductsService } from './products.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { UserRole } from 'src/auth/dto/auth-credentials.dto';
import { Product } from './schema/products.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { FindAllResponse } from './models/findAll-response.model';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

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
    @Body() createProductDto: CreateProductDto,
  ): Promise<{ status: 'success'; data: { product: Product } }> {
    const product = await this.productsService.create(createProductDto);
    return { status: 'success', data: { product } };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<{
    status: string;
    data: { products };
  }> {
    const products: FindAllResponse = await this.productsService.findAll();
    return { status: 'success', data: { products } };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<{ status: 'success'; data: { product: Product } }> {
    const product = await this.productsService.findOneById(id);
    return { status: 'success', data: { product } };
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
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<{ status: string; data: { product: Product } }> {
    const product = await this.productsService.update(id, updateProductDto);
    return { status: 'success', data: { product } };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(
    @Param('id') id: string,
  ): Promise<{ status: string; data: { product: Product } }> {
    const product = await this.productsService.remove(id);
    return { status: 'success', data: { product } };
  }
}
