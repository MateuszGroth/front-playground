import { Injectable } from '@nestjs/common';
import { IngredientsOnRecipes, Recipe, StepsOnRecipes } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRecipeDto, EditRecipeDto } from './dto';

@Injectable()
export class RecipeService {
  constructor(private prisma: PrismaService) {}

  getRecipes() {
    return;
  }

  async createRecipe(userId: number, dto: CreateRecipeDto) {
    const { ingredients, steps } = dto;

    const stepsOnRecipeData = steps.map((step, index) => {
      return {
        stepNumber: index + 1,
        description: step.description,
      };
    });

    try {
      const recipe = await this.prisma.recipe.create({
        data: {
          authorId: userId,
          title: dto.title,
          description: dto.description,
          ingredients: {
            createMany: {
              data: ingredients,
            },
          },
          steps: {
            createMany: {
              data: stepsOnRecipeData,
            },
          },
        },
        include: {
          ingredients: true,
          steps: true,
        },
      });

      return recipe;
    } catch (error) {
      // catch unique title error
      // catch no ingredient id (foreign key constraint) error
    }

    return null;
  }

  getRecipeById(recipeId: number) {
    return;
  }

  editRecipeById(userId: number, recipeId: number, dto: EditRecipeDto) {
    return;
  }

  deleteRecipeById(recipeId: number) {
    return;
  }
}
