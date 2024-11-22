import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './../entities/order.entity';
import { CreateOrderDto } from './../dtos/create-order.dto';
import logger from './../../utils/logger';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      logger.info('Creating order', { createOrderDto });

      const newOrder = this.ordersRepository.create(createOrderDto);
      const savedOrder = await this.ordersRepository.save(newOrder);
      logger.info('Order created successfully', {
        orderId: savedOrder.id,
        userId: savedOrder.userId,
      });
      return savedOrder;
    } catch (error) {
      logger.error('Error creating order', { error });
      throw error;
    }
  }

  async getOrderById(id: number): Promise<Order> {
    logger.info('Getting order by id', { orderId: id });

    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      logger.warn('Order not found', { orderId: id });
      throw new NotFoundException('Order not found');
    }
    return order;
  }
}
