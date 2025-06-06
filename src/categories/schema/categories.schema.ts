/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import slugify from 'slugify';

export type CategoryDocument = Category & Document;

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
export class Category {
  id?: string;

  @Prop({ type: String, unique: true, trim: true })
  name: string;

  @Prop({ type: String, trim: true })
  slugname: string;

  @Prop({ type: String, trim: true, default: 'categories-icons-default.png' })
  icon: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ slug: 1 });

CategorySchema.pre<CategoryDocument>(
  'save',
  function (this: CategoryDocument, next) {
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
