import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true, // Hacemos que las variables de entorno estén disponibles globalmente
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('app.database.host'),
        port: configService.get<number>('app.database.port'),
        username: configService.get<string>('app.database.username'),
        password: configService.get<string>('app.database.password'),
        database: configService.get<string>('app.database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
