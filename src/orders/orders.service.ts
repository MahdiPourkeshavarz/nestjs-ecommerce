/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ProductsRepository } from 'src/products/product.repository';
import { UsersRepository } from 'src/users/users.repository';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './schema/orders.schema';
import { FindAllResponse } from './models/findAll-response.model';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Product } from 'src/products/schema/products.schema';

@Injectable()
export class OrdersService {
  constructor(
    private readonly productRepository: ProductsRepository,
    private readonly userRepository: UsersRepository,
    private readonly orderRepository: OrdersRepository,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    let totalPrice = 0;
    if (!(await this.userRepository.findById(createOrderDto.user))) {
      throw new NotFoundException(
        `user with ID "${createOrderDto.user}" not found`,
      );
    }
    for (const product of createOrderDto.products) {
      const foundedProduct: Product | null =
        await this.productRepository.findById(product.product);
      if (!foundedProduct) {
        throw new NotFoundException(
          `product with ID "${product.product}" not found`,
        );
      } else {
        totalPrice += foundedProduct.price * product.count;
      }
    }
    const orderPayload = {
      ...createOrderDto,
      totalPrice: totalPrice,
    };
    try {
      const orderDoc = await this.orderRepository.create(orderPayload);
      return orderDoc.toObject() as Order;
    } catch (error) {
      throw new InternalServerErrorException('could not create order', error);
    }
  }

  async findAll(): Promise<FindAllResponse> {
    const { orders, total } = await this.orderRepository.findAll();
    const page = 1;
    const limit = 10;
    const totalPages = Math.ceil(total / limit);

    const sanitizedOrders = orders.map((order) => {
      return order.toObject();
    });

    return {
      status: 'success',
      page: Number(page),
      per_page: Number(limit),
      total,
      total_pages: totalPages,
      data: { orders: sanitizedOrders as Order[] },
    };
  }

  async findOneById(id: string): Promise<Order> {
    const OrderDoc = await this.orderRepository.findById(id);
    if (!OrderDoc) {
      throw new NotFoundException(`order with ID "${id}" not found`);
    }
    return OrderDoc.toObject() as Order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const user = await this.userRepository.findById(updateOrderDto.user);
    const order = await this.orderRepository.findById(updateOrderDto.user);
    if (!user || !order) {
      throw new NotFoundException('not found');
    }

    const updatedOrder = await this.orderRepository.update(id, updateOrderDto);
    return updatedOrder?.toObject() as Order;
  }

  async remove(id: string): Promise<Order> {
    const orderToDelete = await this.orderRepository.remove(id);
    if (!orderToDelete) {
      throw new NotFoundException('order not found');
    }
    return orderToDelete.toObject() as Order;
  }
}
