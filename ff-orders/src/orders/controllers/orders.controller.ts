import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { OrdersService } from './../services/order.service';
import { CreateOrderDto } from './../dtos/create-order.dto';
import { Order } from './../entities/order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: number): Promise<Order> {
    return this.ordersService.getOrderById(id);
  }
}
