import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './order.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './../entities/order.entity';
import { NotFoundException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: Repository<Order>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    repository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  it('should create a new order', async () => {
    const createOrderDto = { userId: 1, status: 'pending' };
    const savedOrder = {
      id: 1,
      ...createOrderDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(repository, 'create').mockReturnValue(createOrderDto as Order);
    jest.spyOn(repository, 'save').mockResolvedValue(savedOrder as Order);

    const result = await service.createOrder(createOrderDto);

    expect(result).toEqual(savedOrder);
    expect(repository.create).toHaveBeenCalledWith(createOrderDto);
    expect(repository.save).toHaveBeenCalledWith(createOrderDto);
  });

  it('should get an order by ID', async () => {
    const orderId = 1;
    const foundOrder = {
      id: orderId,
      userId: 1,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(repository, 'findOne').mockResolvedValue(foundOrder as Order);

    const result = await service.getOrderById(orderId);

    expect(result).toEqual(foundOrder);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: orderId } });
  });

  it('should throw NotFoundException if order not found', async () => {
    const orderId = 1;

    jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);

    await expect(service.getOrderById(orderId)).rejects.toThrow(
      NotFoundException,
    );
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: orderId } });
  });
});
