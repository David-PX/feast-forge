import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KitchenService } from './services/kitchen.service';
import { KitchenController } from './controllers/kitchen.controller';
import { Recipe, RecipeSchema } from './schemes/recipe.schema';
import { HttpModule } from '@nestjs/axios';
import { RabbitMQConfigModule } from 'src/config/rabbitmq.config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Recipe.name, schema: RecipeSchema }]),
    HttpModule,
    RabbitMQConfigModule,
  ],
  providers: [KitchenService],
  controllers: [KitchenController],
})
export class KitchenModule {}
