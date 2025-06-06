/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';

@Schema({ id: false })
export class WishlistItem {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  discount: number;

  @Prop({
    type: [String],
    default: ['products-images-default.jpeg'],
    trim: true,
  })
  images: string[];
}
export const WishlistItemSchema = SchemaFactory.createForClass(WishlistItem);

export type UserDocument = User & Document;

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)/;

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
export class User {
  [x: string]: any;
  @Prop({ type: String, trim: true })
  firstname: string;

  @Prop({ type: String, trim: true })
  lastname: string;

  @Prop({
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  })
  username: string;

  @Prop({
    type: String,
    minlength: [8, 'password must have 8 or more character'],
    select: false,
    validate: {
      validator: (password) => passwordRegex.test(password),
      message: 'password must have at least one letter and one digit',
    },
    trim: true,
  })
  password: string;

  @Prop({ type: String, unique: true, trim: true })
  phoneNumber: string;

  @Prop({ type: String, trim: true })
  address: string;

  @Prop({
    type: [WishlistItemSchema],
    default: [],
  })
  wishlist: [];

  @Prop({
    type: String,
    default: 'USER',
    enum: { values: ['ADMIN', 'USER'], message: 'invalid role: ({VALUE})' },
  })
  role: string;
}
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', async function (next) {
  if (this.isModified('password')) {
    if (typeof this.password === 'string' && this.password.length > 0) {
      if (
        this.password.startsWith('$2a$') ||
        this.password.startsWith('$2b$') ||
        this.password.startsWith('$2y$')
      ) {
        return next();
      }
      try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
      } catch (error) {
        next(error as Error);
      }
    } else {
      next(new Error('Password was marked as modified but is invalid.'));
    }
  } else {
    next();
  }
});

UserSchema.methods.comparePassword = async function (
  candiPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candiPassword, this.password);
};
