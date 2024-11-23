import { Controller, Post } from '@nestjs/common';
import { KitchenService } from './../services/kitchen.service';
import { Recipe } from './../schemes/recipe.schema';

@Controller('kitchen')
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  @Post('prepare')
  async prepareDish(): Promise<Recipe> {
    return;
  }
}
