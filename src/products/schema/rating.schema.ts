/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Rating {
  @Prop({ type: Number, default: 0, min: 0, max: 5 })
  rate: number;

  @Prop({ type: Number, default: 0, min: 0 })
  count: number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
