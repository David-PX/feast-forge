import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Recipe extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [{ name: String, quantity: Number }], required: true })
  ingredients: { name: string; quantity: number }[];
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
