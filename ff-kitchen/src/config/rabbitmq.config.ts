import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: () => ({
        exchanges: [
          {
            name: 'orderExchange',
            type: 'topic',
          },
          {
            name: 'kitchenExchange',
            type: 'topic',
          },
          {
            name: 'inventoryExchange',
            type: 'topic',
          },
        ],
        uri: process.env.RABBITMQ_URI,
        connectionInitOptions: { wait: false },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [RabbitMQModule],
})
export class RabbitMQConfigModule {}
