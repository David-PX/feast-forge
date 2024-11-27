import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
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
        ],
        uri: process.env.RABBITMQ_URI,
        connectionInitOptions: {
          wait: true, // Espera a que el broker esté disponible
          reconnectTimeInSeconds: 5,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [RabbitMQModule],
})
export class RabbitMQConfigModule {}
