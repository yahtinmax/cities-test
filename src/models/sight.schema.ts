import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SightDocument = Sight & Document;

@Schema()
export class Sight {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  architect: string;
}

export const SightSchema = SchemaFactory.createForClass(Sight);
