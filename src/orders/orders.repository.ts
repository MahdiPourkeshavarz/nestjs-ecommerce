/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schema/orders.schema';
import { FilterQuery, Model } from 'mongoose';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(orderPayload: Record<string, any>): Promise<OrderDocument> {
    const newOrder = new this.orderModel(orderPayload);
    await newOrder.save();
    return await newOrder.populate([
      { path: 'user' },
      { path: 'products.product' },
    ]);
  }

  async findAll(): Promise<{ orders: OrderDocument[]; total: number }> {
    const orders = await this.orderModel
      .find({})
      .populate(['user', 'products.product'])
      .exec();

    const total = await this.orderModel.countDocuments();

    return {
      orders,
      total,
    };
  }

  async findById(id: string): Promise<OrderDocument | null> {
    const order = await this.orderModel.findById(id);
    if (!order) {
      return null;
    }
    return await order.populate(['user', 'products.product']);
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderDocument | null> {
    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(id, { $set: updateOrderDto }, { new: true })
      .populate(['user', 'products.product']);

    return updatedOrder;
  }

  async remove(id: string): Promise<OrderDocument | null> {
    return await this.orderModel
      .findByIdAndDelete(id)
      .populate(['user', 'products.product']);
  }

  async exist(filterQuery: FilterQuery<OrderDocument>): Promise<boolean> {
    const count = await this.orderModel.countDocuments(filterQuery);
    return count > 0;
  }
}
