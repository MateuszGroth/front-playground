import {
  Controller,
  Delete,
  Get,
  UseGuards,
  Post,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtAuthGuard } from 'src/auth/guard';
import { CreateRecipeDto, EditRecipeDto } from './dto';
import { RecipeService } from './recipe.service';

@UseGuards(JwtAuthGuard)
@Controller('recipes')
export class RecipeController {
  constructor(private recipeService: RecipeService) {}

  @Get()
  getRecipes() {
    return this.recipeService.getRecipes();
  }

  @Post()
  createRecipe(@GetUser('sub') userId: number, @Body() dto: CreateRecipeDto) {
    return this.recipeService.createRecipe(userId, dto);
  }

  @Get(':id')
  getRecipeById(@Param('id', ParseIntPipe) recipeId: number) {
    return this.recipeService.getRecipeById(recipeId);
  }

  @Patch(':id')
  editRecipeById(
    @GetUser('sub') userId: number,
    @Param('id', ParseIntPipe) recipeId: number,
    @Body() dto: EditRecipeDto,
  ) {
    return this.recipeService.editRecipeById(userId, recipeId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteRecipeById(
    @GetUser('sub') userId: number,
    @Param('id', ParseIntPipe) recipeId: number,
  ) {
    return this.recipeService.deleteRecipeById(userId, recipeId);
  }
}
