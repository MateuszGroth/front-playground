/*
  Warnings:

  - You are about to drop the column `step` on the `recipe_steps` table. All the data in the column will be lost.
  - Added the required column `description` to the `recipe_steps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "recipe_steps" DROP COLUMN "step",
ADD COLUMN     "description" TEXT NOT NULL;
