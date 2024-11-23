import { Controller, Post, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('request-ingredients')
  async checkAndReduceIngredients(
    @Body('ingredients') ingredients: { name: string; quantity: number }[],
  ) {
    return this.inventoryService.checkAndReduceIngredients(ingredients);
  }
}
