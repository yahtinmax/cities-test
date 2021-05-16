import { forwardRef, Module } from '@nestjs/common';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Sight, SightSchema } from '../models/sight.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sight.name, schema: SightSchema }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [CitiesController],
  providers: [CitiesService],
})
export class CitiesModule {}
