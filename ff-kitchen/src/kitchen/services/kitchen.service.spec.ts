import { Test, TestingModule } from '@nestjs/testing';
import { KitchenService } from './kitchen.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Dish } from './../entities/dish.entity';

describe('KitchenService', () => {
  let service: KitchenService;
  let repository: Repository<Dish>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KitchenService,
        {
          provide: getRepositoryToken(Dish),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<KitchenService>(KitchenService);
    repository = module.get<Repository<Dish>>(getRepositoryToken(Dish));
  });

  it('should prepare a new dish', async () => {
    const createDishDto = {
      name: 'Spaghetti Bolognese',
      ingredients: { tomato: 2, meat: 1, onion: 1, spaghetti: 3 },
    };
    const savedDish = {
      id: 1,
      ...createDishDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest
      .spyOn(repository, 'create')
      .mockReturnValue(createDishDto as unknown as Dish);
    jest.spyOn(repository, 'save').mockResolvedValue(savedDish as Dish);

    const result = await service.prepareDish(createDishDto);

    expect(result).toEqual(savedDish);
    expect(repository.create).toHaveBeenCalledWith(createDishDto);
    expect(repository.save).toHaveBeenCalledWith(createDishDto);
  });

  it('should get a dish by ID', async () => {
    const dishId = 1;
    const foundDish = {
      id: dishId,
      name: 'Spaghetti Bolognese',
      ingredients: { tomato: 2, meat: 1, onion: 1, spaghetti: 3 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(repository, 'findOne').mockResolvedValue(foundDish as Dish);

    const result = await service.getDishById(dishId);

    expect(result).toEqual(foundDish);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: dishId } });
  });
});
