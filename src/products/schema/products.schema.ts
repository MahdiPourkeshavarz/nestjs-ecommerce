/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Category } from 'src/categories/schema/categories.schema';
import { SubCategory } from 'src/subcategories/schema/subcategories.schema';
import { Rating, RatingSchema } from './rating.schema';
import slugify from 'slugify';

export type ProductDocument = Product & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();

      delete ret._id;
      delete ret.__v;

      if (ret.category && !ret.category.name) delete ret.category;
      if (ret.subcategory && !ret.subcategory.name) delete ret.subcategory;

      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      if (ret.category && !ret.category.name) delete ret.category;
      if (ret.subcategory && !ret.subcategory.name) delete ret.subcategory;
      return ret;
    },
  },
})
export class Product {
  id?: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true,
  })
  category: Category;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'SubCategory',
    required: true,
    index: true,
  })
  subcategory: SubCategory;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    type: String,
    trim: true,
  })
  slugname: string;

  @Prop({
    type: Number,
  })
  price: number;

  @Prop({
    type: Number,
  })
  quantity: number;

  @Prop({
    type: String,
    trim: true,
  })
  brand: string;

  @Prop({
    type: Number,
  })
  discount: number;

  @Prop({
    type: String,
    trim: true,
  })
  description: string;

  @Prop({
    type: String,
    trim: true,
    default: 'products-thumbnails-default.jpeg',
  })
  thumbnail: string;

  @Prop({
    type: [String],
    trim: true,
    default: ['products-thumbnails-default.jpeg'],
  })
  images: [string];

  @Prop({
    type: RatingSchema,
  })
  rating: Rating;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ slugname: 1 });

ProductSchema.pre<ProductDocument>(
  'save',
  function (this: ProductDocument, next) {
    if (this.name) {
      this.slugname = slugify(this.name, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      });
    }
    next();
  },
);
