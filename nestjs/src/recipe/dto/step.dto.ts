import { IsString, MaxLength, MinLength } from 'class-validator';

export class StepDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  description: string;
}
