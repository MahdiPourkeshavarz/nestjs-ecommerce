/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import slugify from 'slugify';
import { Category } from '../../categories/schema/categories.schema';

export type SubCategoryDocument = SubCategory & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.category;
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.category;
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class SubCategory {
  id?: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true,
  })
  category: Category;

  @Prop({ type: String, unique: true, trim: true })
  name: string;

  @Prop({ type: String, trim: true })
  slugname: string;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);

SubCategorySchema.index({ slug: 1 });

SubCategorySchema.pre<SubCategoryDocument>(
  'save',
  function (this: SubCategoryDocument, next) {
    if (this.name && (this.isModified('name') || this.isNew)) {
      this.slugname = slugify(this.name, {});
    }
    next();
  },
);
