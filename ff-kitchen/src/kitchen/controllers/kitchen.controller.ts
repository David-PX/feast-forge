import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { KitchenService } from './../services/kitchen.service';
import { CreateDishDto } from './../dtos/create-dish.dto';
import { Dish } from './../entities/dish.entity';

@Controller('kitchen')
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  @Post('prepare')
  async prepareDish(@Body() createDishDto: CreateDishDto): Promise<Dish> {
    return this.kitchenService.prepareDish(createDishDto);
  }

  @Get(':id')
  async getDishById(@Param('id') id: number): Promise<Dish> {
    return this.kitchenService.getDishById(id);
  }
}
