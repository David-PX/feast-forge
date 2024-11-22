import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from './../entities/dish.entity';
import { CreateDishDto } from './../dtos/create-dish.dto';
import logger from './../../utils/logger';

@Injectable()
export class KitchenService {
  constructor(
    @InjectRepository(Dish)
    private dishesRepository: Repository<Dish>,
  ) {}

  async prepareDish(createDishDto: CreateDishDto): Promise<Dish> {
    try {
      logger.info('Preparing dish', { dish: createDishDto });

      const { name, ingredients } = createDishDto;
      const newDish = this.dishesRepository.create({ name, ingredients });
      const savedDish = await this.dishesRepository.save(newDish);
      logger.info('Dish prepared successfully', {
        dishId: savedDish.id,
        name: savedDish.name,
      });
      return savedDish;
    } catch (error) {
      logger.error('Error preparing dish', { error });
      throw error;
    }
  }

  async getDishById(id: number): Promise<Dish> {
    logger.info('Fetching dish', { dishId: id });

    const dish = await this.dishesRepository.findOne({ where: { id } });
    if (!dish) {
      logger.warn('Dish not found', { dishId: id });
      throw new BadRequestException('Dish not found');
    }
    return dish;
  }
}
