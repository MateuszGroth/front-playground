/*
  Warnings:

  - The primary key for the `IngredientsOnRecipes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `categoryId` to the `ingredients` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "IngredientsOnRecipes" DROP CONSTRAINT "IngredientsOnRecipes_ingredientId_fkey";

-- DropForeignKey
ALTER TABLE "IngredientsOnRecipes" DROP CONSTRAINT "IngredientsOnRecipes_recipeId_fkey";

-- AlterTable
ALTER TABLE "IngredientsOnRecipes" DROP CONSTRAINT "IngredientsOnRecipes_pkey",
ADD COLUMN     "customIngredient" TEXT,
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "ingredientId" DROP NOT NULL,
ADD CONSTRAINT "IngredientsOnRecipes_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ingredients" ADD COLUMN     "categoryId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "recipe_steps" (
    "id" SERIAL NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "step" TEXT NOT NULL,

    CONSTRAINT "recipe_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredient_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ingredient_categories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ingredient_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientsOnRecipes" ADD CONSTRAINT "IngredientsOnRecipes_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientsOnRecipes" ADD CONSTRAINT "IngredientsOnRecipes_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
