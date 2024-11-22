import { IsString, IsObject } from 'class-validator';

export class CreateDishDto {
  @IsString()
  readonly name: string;

  @IsObject()
  readonly ingredients: Record<string, number>;
}
