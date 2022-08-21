import {
  ArrayNotEmpty,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IngriedientDto } from './ingredient.dto';
import { StepDto } from './step.dto';

export class CreateRecipeDto {
  @IsString()
  @MinLength(3)
  @MaxLength(60)
  title: string;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  description: string;

  @IsArray() // or is object
  @ArrayNotEmpty()
  @ValidateNested({ each: true }) // each because we have an array of objects
  @Type(() => IngriedientDto)
  ingredients: IngriedientDto[];

  @IsArray() // or is object
  @ArrayNotEmpty()
  @ValidateNested({ each: true }) // each because we have an array of objects
  @Type(() => StepDto)
  steps: StepDto[];
}
