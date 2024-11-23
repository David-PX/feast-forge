import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KitchenService } from './services/kitchen.service';
import { KitchenController } from './controllers/kitchen.controller';
import { Recipe, RecipeSchema } from './schemes/recipe.schema';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Recipe.name, schema: RecipeSchema }]),
    HttpModule,
  ],
  providers: [KitchenService],
  controllers: [KitchenController],
})
export class KitchenModule {}
