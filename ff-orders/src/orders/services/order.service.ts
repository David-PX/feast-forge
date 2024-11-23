import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './../entities/order.entity';
import { CreateOrderDto } from './../dtos/create-order.dto';
import logger from './../../utils/logger';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      logger.info('Creating order', { createOrderDto });

      const newOrder = this.ordersRepository.create(createOrderDto);
      const savedOrder = await this.ordersRepository.save(newOrder);

      this.amqpConnection.publish('orderExchange', 'order.created', {
        orderId: savedOrder.id,
        customerId: savedOrder.userId,
      });

      logger.info('Order created successfully', {
        orderId: savedOrder.id,
        userId: savedOrder.userId,
        status: savedOrder.status,
      });
      return savedOrder;
    } catch (error) {
      logger.error('Error creating order', { error });
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: 'kitchenExchange',
    routingKey: 'recipe.*',
    queue: 'ordersQueue',
  })
  async handleRecipeStatusUpdate(message: any) {
    logger.info(`Received recipe update: ${JSON.stringify(message)}`);

    const { orderId, status } = message;

    // Lógica para actualizar la orden con el nuevo estado
    if (!orderId || !status) {
      throw new NotFoundException('Order ID or status missing from message');
    }

    // Simulación de actualización en la base de datos
    logger.info(`Order ${orderId} status updated to: ${status}`);

    // Aquí se podría agregar lógica para notificar al cliente el cambio de estado
    // Esto podría ser a través de WebSockets, APIs, etc.
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
