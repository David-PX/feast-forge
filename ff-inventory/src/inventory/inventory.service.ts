import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ingredient } from './ingredient.schema';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { RabbitSubscribe, AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import logger from './../utils/logger';

interface MarketResponse {
  quantitySold: number;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Ingredient.name) private ingredientModel: Model<Ingredient>,
    private readonly httpService: HttpService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  @RabbitSubscribe({
    exchange: 'inventoryExchange',
    routingKey: 'inventory.request',
    queue: 'inventoryQueue',
  })
  async handleIngredientRequest(message: any): Promise<void> {
    const { orderId, ingredients } = message;

    if (!orderId || !ingredients || !Array.isArray(ingredients)) {
      logger.error('Invalid message format', { message });
      throw new Error('Invalid message format');
    }

    logger.info(`Received ingredient request for order ${orderId}`);

    let allIngredientsAvailable = true;
    const updatedIngredients = [];

    for (const ingredient of ingredients) {
      const foundIngredient = await this.ingredientModel
        .findOne({ name: ingredient.name })
        .exec();
      let availableQuantity = foundIngredient ? foundIngredient.quantity : 0;

      logger.info(
        `Checking availability for ${ingredient.name}: ${availableQuantity} available`,
      );

      if (availableQuantity < ingredient.quantity) {
        try {
          const response = await firstValueFrom(
            this.httpService
              .get<MarketResponse>(
                `${process.env.MARKET_ENDPOINT}?ingredient=${ingredient.name}`,
                { timeout: 5000 },
              )
              .pipe(
                catchError((error: AxiosError) => {
                  logger.error(
                    `Error while requesting ingredient from market: ${error.message}`,
                  );
                  throw new Error('Market request failed');
                }),
              ),
          );

          const quantitySold = response.data.quantitySold || 0;

          logger.info(
            `Market response for ${ingredient.name}: ${quantitySold} units sold`,
          );

          availableQuantity += quantitySold;
        } catch (error) {
          allIngredientsAvailable = false;
          logger.error(
            `Unable to obtain ingredient ${ingredient.name} from the market + ${error.message}`,
          );
        }
      }

      if (availableQuantity >= ingredient.quantity) {
        updatedIngredients.push({
          name: ingredient.name,
          quantity: ingredient.quantity,
        });

        await this.ingredientModel
          .updateOne(
            { name: ingredient.name },
            { $set: { quantity: availableQuantity - ingredient.quantity } },
            { upsert: true },
          )
          .exec();
      } else {
        allIngredientsAvailable = false;
        updatedIngredients.push({
          name: ingredient.name,
          quantity: availableQuantity,
        });
      }
    }

    // Publicar la respuesta a `ff-kitchen` con la disponibilidad de los ingredientes
    this.amqpConnection.publish('inventoryExchange', 'inventory.response', {
      orderId,
      success: allIngredientsAvailable,
      ingredients: updatedIngredients,
    });

    logger.info(
      allIngredientsAvailable
        ? `All ingredients available for order ${orderId}`
        : `Ingredients missing for order ${orderId}`,
    );
  }
}
