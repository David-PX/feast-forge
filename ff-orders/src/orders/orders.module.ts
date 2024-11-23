import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './services/order.service';
import { OrdersController } from './controllers/orders.controller';
import { Order } from './entities/order.entity';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), RabbitMQModule],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
