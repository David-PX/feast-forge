import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './../orders.module';
import { Order } from './../entities/order.entity';

jest.setTimeout(30000); // Aumenta el timeout a 30 segundos para todas las pruebas del archivo

describe('OrdersController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    console.log('Inicializando módulo de pruebas...');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite', // Utiliza SQLite en memoria para las pruebas
          database: ':memory:',
          entities: [Order],
          synchronize: true,
        }),
        OrdersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Espera 1 segundo antes de empezar las pruebas
    console.log('Aplicación inicializada');
  });

  afterAll(async () => {
    await app.close();
  });

  it('/POST orders (should create a new order)', async () => {
    const createOrderDto = { userId: 1, status: 'pending' };

    const response = await request(app.getHttpServer())
      .post('/orders')
      .send(createOrderDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toMatchObject({
      userId: 1,
      status: 'pending',
    });
  });

  it('/GET orders/:id (should get an order by ID)', async () => {
    const createOrderDto = { userId: 1, status: 'completed' };

    // Crear una nueva orden para obtenerla posteriormente
    const createdOrder = await request(app.getHttpServer())
      .post('/orders')
      .send(createOrderDto)
      .expect(201);

    const orderId = createdOrder.body.id;

    // Obtener la orden creada
    const response = await request(app.getHttpServer())
      .get(`/orders/${orderId}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: orderId,
      userId: 1,
      status: 'completed',
    });
  });

  it('/GET orders/:id (should return 404 if order not found)', async () => {
    await request(app.getHttpServer()).get('/orders/999').expect(404);
  });
});
