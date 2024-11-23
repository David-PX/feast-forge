import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ingredient } from './ingredient.schema';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import Logger from './../utils/logger';
import logger from './../utils/logger';

interface MarketResponse {
  quantitySold: number;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Ingredient.name) private ingredientModel: Model<Ingredient>,
    private readonly httpService: HttpService,
  ) {}

  async checkAndReduceIngredients(
    ingredients: { name: string; quantity: number }[],
  ): Promise<{
    success: boolean;
    ingredients: { name: string; quantity: number }[];
  }> {
    logger.info('Checking and reducing ingredients');

    const updatedIngredients = [];
    let allIngredientsAvailable = true;

    for (const ingredient of ingredients) {
      const foundIngredient = await this.ingredientModel
        .findOne({ name: ingredient.name })
        .exec();
      const requiredQuantity = ingredient.quantity;
      let availableQuantity = foundIngredient ? foundIngredient.quantity : 0;

      logger.info(`${ingredient.name}: ${availableQuantity} available`);

      if (availableQuantity < requiredQuantity) {
        logger.info('Requesting more ingredients from the market');

        const url = `${process.env.MARKET_ENDPOINT}?ingredient=${ingredient.name}`;
        logger.info(
          `Requesting ${requiredQuantity} ${ingredient.name} from ${url}`,
        );

        const { data } = await firstValueFrom(
          this.httpService.get<MarketResponse>(url).pipe(
            catchError((error: AxiosError) => {
              Logger.error(
                error.response?.data ||
                  'An error occurred while requesting the market ' + error,
              );
              throw new Error(error.toString());
            }),
          ),
        );

        logger.info(`Response: ${JSON.stringify(data.quantitySold)}`);

        if (data.quantitySold > 0) {
          availableQuantity += data.quantitySold;
        }
      }

      if (availableQuantity >= requiredQuantity) {
        logger.info('Ingredient available');
        await this.ingredientModel
          .updateOne(
            { name: ingredient.name },
            { $set: { quantity: availableQuantity - requiredQuantity } },
            { upsert: true },
          )
          .exec();
        updatedIngredients.push({
          name: ingredient.name,
          quantity: requiredQuantity,
        });
      } else {
        allIngredientsAvailable = false;
        updatedIngredients.push({
          name: ingredient.name,
          quantity: availableQuantity,
        });
      }
    }

    return {
      success: allIngredientsAvailable,
      ingredients: updatedIngredients,
    };
  }
}
