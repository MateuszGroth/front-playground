import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRecipeDto, EditRecipeDto } from './dto';
import { IngredientDto } from './dto/ingredient.dto';
import { StepDto } from './dto/step.dto';

@Injectable()
export class RecipeService {
  constructor(private prisma: PrismaService) {}

  async getRecipes() {
    const recipes = await this.prisma.recipe.findMany({
      include: {
        ingredients: true,
        steps: true,
      },
    });

    return recipes;
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

  async getRecipeById(recipeId: number) {
    const recipe = await this.prisma.recipe.findUnique({
      where: {
        id: recipeId,
      },
      include: {
        ingredients: true,
        steps: true,
      },
    });

    if (!recipe) {
      throw new NotFoundException('Resource not found');
    }

    return recipe;
  }

  async editRecipeById(userId: number, recipeId: number, dto: EditRecipeDto) {
    const recipe = await this.prisma.recipe.findUnique({
      where: {
        id: recipeId,
      },
    });

    if (!recipe) {
      throw new NotFoundException('Resource not found');
    }

    if (recipe.authorId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }

    const recipeUpdateData: {
      title?: string;
      description?: string;
      ingredients?: {
        deleteMany: Record<string, unknown>;
        createMany: {
          data: IngredientDto[];
        };
      };
      steps?: {
        deleteMany: Record<string, unknown>;
        createMany: {
          data: Array<StepDto & { stepNumber: number }>;
        };
      };
    } = {
      title: dto.title,
      description: dto.description,
    };
    const { ingredients, steps } = dto;

    if (ingredients && ingredients.length) {
      recipeUpdateData.ingredients = {
        deleteMany: {},
        createMany: {
          data: ingredients,
        },
      };
    }

    if (steps && steps.length) {
      const stepsOnRecipeData = steps.map((step, index) => {
        return {
          stepNumber: index + 1,
          description: step.description,
        };
      });

      recipeUpdateData.steps = {
        deleteMany: {},
        createMany: {
          data: stepsOnRecipeData,
        },
      };
    }

    const editedRecipe = await this.prisma.recipe.update({
      where: {
        id: recipeId,
      },
      data: recipeUpdateData,
      include: {
        ingredients: true,
        steps: true,
      },
    });

    return editedRecipe;
  }

  async deleteRecipeById(userId: number, recipeId: number) {
    const recipe = await this.prisma.recipe.findUnique({
      where: {
        id: recipeId,
      },
    });

    if (!recipe) {
      throw new NotFoundException('Resource not found');
    }

    if (recipe.authorId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }

    await this.prisma.recipe.delete({
      where: {
        id: recipeId,
      },
    });
  }
}
