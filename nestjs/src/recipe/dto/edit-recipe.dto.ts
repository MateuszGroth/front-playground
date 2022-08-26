import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IngredientDto } from './ingredient.dto';
import { StepDto } from './step.dto';

export class EditRecipeDto {
  @IsString()
  @MinLength(3)
  @MaxLength(60)
  @IsOptional()
  title?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsArray() // or is object
  @ArrayNotEmpty()
  @ValidateNested({ each: true }) // each because we have an array of objects
  @Type(() => IngredientDto)
  ingredients?: IngredientDto[];

  @IsOptional()
  @IsArray() // or is object
  @ArrayNotEmpty()
  @ValidateNested({ each: true }) // each because we have an array of objects
  @Type(() => StepDto)
  steps?: StepDto[];
}
