import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { InventoryModule } from './inventory/inventory.module';
import { HttpModule } from '@nestjs/axios';
import { RabbitMQConfigModule } from './config/rabbitmq.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    InventoryModule,
    RabbitMQConfigModule,
    HttpModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
