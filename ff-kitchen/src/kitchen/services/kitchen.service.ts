/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Recipe } from './../schemes/recipe.schema';
import logger from './../../utils/logger';

@Injectable()
export class KitchenService {
  constructor(
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>,
    private readonly httpService: HttpService,
  ) {}

  async prepareDish(): Promise<Recipe> {
    const recipes = await this.recipeModel.find().exec();

    if (recipes.length === 0) {
      throw new NotFoundException('No recipes found');
    }

    const randomIndex = Math.floor(Math.random() * recipes.length);
    const selectedRecipe = recipes[randomIndex];

    const response = await this.httpService.post(`${process.env.INVENTORY_SERVICE_URL}/check`, {
        ingredients: selectedRecipe.ingredients,
    }).toPromise();

    if (!response.data.success) {
      throw new NotFoundException('Ingredients not available');
    }

    logger.info('Dish prepared successfully', {
      dishName: selectedRecipe.name,
    });
    return selectedRecipe;
  }
}
