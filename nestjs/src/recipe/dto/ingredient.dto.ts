import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CustomIngredient } from './decorator';

export class IngriedientDto {
  @IsNumber()
  @IsOptional()
  ingredientId?: number;

  @CustomIngredient('ingredientId')
  customIngredient?: string;

  @IsNumber()
  quantity: number;

  @IsString()
  @MinLength(1)
  @MaxLength(24)
  quantityUnit: string;
}
