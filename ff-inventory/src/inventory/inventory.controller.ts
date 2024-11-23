import { Controller, Post } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('request-ingredients')
  async checkAndReduceIngredients() {
    return;
  }
}
