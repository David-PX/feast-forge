import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KitchenService } from './services/kitchen.service';
import { KitchenController } from './controllers/kitchen.controller';
import { Dish } from './entities/dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dish])],
  providers: [KitchenService],
  controllers: [KitchenController],
})
export class KitchenModule {}
