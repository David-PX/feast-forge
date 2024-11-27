import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './services/order.service';
import { OrdersController } from './controllers/orders.controller';
import { Order } from './entities/order.entity';
import { RabbitMQConfigModule } from 'src/config/rabbitmq.config';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), RabbitMQConfigModule],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
