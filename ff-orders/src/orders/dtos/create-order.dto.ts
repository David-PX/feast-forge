import { IsInt, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  readonly userId: number;

  @IsString()
  readonly status: string = 'pending';
}
