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
import { OrdersService } from './orders.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { UserRole } from 'src/auth/dto/auth-credentials.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './schema/orders.schema';
import { FindAllResponse } from './models/findAll-response.model';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

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
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<{ status: 'success'; data: { order: Order } }> {
    const order = await this.orderService.create(createOrderDto);
    return { status: 'success', data: { order } };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<{
    status: string;
    data: { orders };
  }> {
    const orders: FindAllResponse = await this.orderService.findAll();
    return { status: 'success', data: { orders } };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<{ status: 'success'; data: { order: Order } }> {
    const order = await this.orderService.findOneById(id);
    return { status: 'success', data: { order } };
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
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<{ status: string; data: { order: Order } }> {
    const order = await this.orderService.update(id, updateOrderDto);
    return { status: 'success', data: { order } };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(
    @Param('id') id: string,
  ): Promise<{ status: string; data: { order: Order } }> {
    const order = await this.orderService.remove(id);
    return { status: 'success', data: { order } };
  }
}
