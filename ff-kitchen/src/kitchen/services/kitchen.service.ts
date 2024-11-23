/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Recipe } from './../schemes/recipe.schema';
import logger from './../../utils/logger';
import { RabbitSubscribe, AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class KitchenService {
  constructor(
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>,
    private readonly httpService: HttpService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  @RabbitSubscribe({
    exchange: 'orderExchange',
    routingKey: 'order.created',
    queue: 'kitchenQueue',
  })
  async handleOrderCreated(message: any): Promise<Recipe> {
   logger.info(`Received order: ${JSON.stringify(message)}`);

    const recipes = await this.recipeModel.find().exec();

    if (recipes.length === 0) {
      throw new NotFoundException('No recipes found');
    }

    this.amqpConnection.publish('kitchenExchange', 'recipe.preparing', {
      orderId: message.orderId,
      status: 'Preparing',
    });

    const randomIndex = Math.floor(Math.random() * recipes.length);
    const selectedRecipe = recipes[randomIndex];

    this.amqpConnection.publish('inventoryExchange', 'inventory.request', {
      orderId: message.orderId,
      ingredients: selectedRecipe.ingredients,
    });

    logger.info('Dish prepared successfully', {
      dishName: selectedRecipe.name,
    });
    return selectedRecipe;
  }

  @RabbitSubscribe({
    exchange: 'inventoryExchange',
    routingKey: 'inventory.response',
    queue: 'kitchenQueue',
  })
  async handleInventoryResponse(message: any): Promise<void> {
    const { orderId, success } = message;
    if (!success) {
      logger.error(`Ingredients not available for order: ${orderId}`);
      throw new NotFoundException('Ingredients not available');
    }

    logger.info(`Ingredients available for order: ${orderId}`);
    // Notificar que los ingredientes están disponibles y la receta se está preparando
    this.amqpConnection.publish('kitchenExchange', 'recipe.preparing', {
      orderId,
      status: 'Preparing',
    });

    // Simulación de preparación del plato
    setTimeout(() => {
      this.finishDishPreparation(orderId);
    }, 5000); // Simulamos un retraso para la preparación del plato

    logger.info(`Recipe prepared for order: ${orderId}`);
  }

  // Método para finalizar la preparación del plato
  private finishDishPreparation(orderId: string): void {
    logger.info(`Dish prepared for order: ${orderId}`);

    // Notificar a ff-orders que la receta está lista
    this.amqpConnection.publish('kitchenExchange', 'recipe.prepared', {
      orderId,
      status: 'Prepared',
    });
  }
}
