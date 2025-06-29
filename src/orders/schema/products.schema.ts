/* eslint-disable prettier/prettier */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Product } from '../../products/schema/products.schema';

@Schema({ _id: false })
export class ProductsInOrder {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  product: Product;

  @Prop({ type: Number, required: true })
  count: number;
}

export const ProductsInOrderSchema =
  SchemaFactory.createForClass(ProductsInOrder);
