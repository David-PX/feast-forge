import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Ingredient, IngredientSchema } from './ingredient.schema';
import { HttpModule } from '@nestjs/axios';
import { RabbitMQConfigModule } from 'src/config/rabbitmq.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ingredient.name, schema: IngredientSchema },
    ]),
    HttpModule,
    RabbitMQConfigModule,
  ],
  providers: [InventoryService],
  controllers: [InventoryController],
})
export class InventoryModule {}
