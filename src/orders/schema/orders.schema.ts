/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/users/schema/users.schema';
import { ProductsInOrder, ProductsInOrderSchema } from './products.schema';

export type OrderDocument = Order & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Order {
  id: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: User;

  @Prop({
    type: [ProductsInOrderSchema],
    required: true,
  })
  products: ProductsInOrder[];

  @Prop({
    type: Number,
  })
  totalPrice: number;

  @Prop({
    type: Date,
    default: () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    },
  })
  deliveryDate: Date;

  @Prop({
    type: Boolean,
    default: false,
  })
  deliveryStatus: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.pre('save', async function (next) {
  let total = 0;

  const doc = await this.populate('products.product', { price: 1 });

  const products = doc.products as unknown as {
    product: { price: number };
    count: number;
  }[];

  for (const { product, count } of products) {
    if (product && product.price) {
      total += product.price * count;
    }
  }

  this.totalPrice = total;

  next();
});
