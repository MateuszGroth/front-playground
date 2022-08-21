import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }

  cleanDb() {
    return this.$transaction([
      this.ingredientsOnRecipes.deleteMany(),
      this.stepsOnRecipes.deleteMany(),
      this.ingredient.deleteMany(),
      this.ingredientCategory.deleteMany(),
      this.recipe.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}
