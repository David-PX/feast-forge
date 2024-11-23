import { Test, TestingModule } from '@nestjs/testing';
import { KitchenService } from './kitchen.service';
import { getModelToken } from '@nestjs/mongoose';
import { Recipe } from './../schemes/recipe.schema';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { NotFoundException } from '@nestjs/common';

describe('KitchenService', () => {
  let service: KitchenService;
  let httpService: HttpService;
  let recipeModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KitchenService,
        {
          provide: getModelToken(Recipe.name),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<KitchenService>(KitchenService);
    httpService = module.get<HttpService>(HttpService);
    recipeModel = module.get(getModelToken(Recipe.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException if no recipes are found', async () => {
    recipeModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
    await expect(service.prepareDish()).rejects.toThrow(NotFoundException);
  });

  it('should select a random recipe and prepare it', async () => {
    const recipes = [
      {
        _id: '1',
        name: 'Spaghetti Bolognese',
        ingredients: [
          { name: 'tomato', quantity: 2 },
          { name: 'meat', quantity: 1 },
        ],
      },
    ];
    recipeModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(recipes),
    });
    (httpService.post as jest.Mock).mockReturnValue(
      of({ data: { success: true } }),
    );

    const result = await service.prepareDish();
    expect(result).toEqual(recipes[0]);
  });

  it('should throw NotFoundException if ingredients are not available', async () => {
    const recipes = [
      {
        _id: '1',
        name: 'Spaghetti Bolognese',
        ingredients: [
          { name: 'tomato', quantity: 2 },
          { name: 'meat', quantity: 1 },
        ],
      },
    ];
    recipeModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(recipes),
    });
    (httpService.post as jest.Mock).mockReturnValue(
      of({ data: { success: false } }),
    );

    await expect(service.prepareDish()).rejects.toThrow(NotFoundException);
  });
});
