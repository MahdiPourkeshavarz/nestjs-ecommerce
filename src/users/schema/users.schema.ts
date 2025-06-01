/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as bcrypt from 'bcryptjs';

@Schema({ _id: false })
export class WishlistItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  _id: string;

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

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true, trim: true })
  firstname: string;

  @Prop({ type: String, required: true, trim: true })
  lastname: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  username: string;

  @Prop({
    type: Number,
    required: true,
    minlength: [8, 'password must have 8 or more character'],
    select: false,
    validate: {
      validator: (password) => passwordRegex.test(password),
      message: 'password must have at least one letter and one digit',
    },
    trim: true,
  })
  password: string;

  @Prop({ type: String, unique: true, required: true, trim: true })
  phoneNumber: string;

  @Prop({ type: String, required: true, trim: true })
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

  @Prop({ type: String, select: false })
  refreshToken: string;
}
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (
  candiPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candiPassword, this.password);
};
