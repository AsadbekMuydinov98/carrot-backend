import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/auth/schemas/use.schema';

@Schema({
  timestamps: true
})
export class Book {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  brand: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
  
  @Prop({ default: false })
  isFav: boolean;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  favourites: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [{ type: String }] })
  images: string[];

  @Prop({ default: 'For sale'})
  state: string;
}

export const BookSchema = SchemaFactory.createForClass(Book)
