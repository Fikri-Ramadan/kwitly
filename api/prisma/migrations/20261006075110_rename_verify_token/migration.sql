/*
  Warnings:

  - You are about to drop the column `verifyToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "verifyToken",
ADD COLUMN     "refreshToken" TEXT;
