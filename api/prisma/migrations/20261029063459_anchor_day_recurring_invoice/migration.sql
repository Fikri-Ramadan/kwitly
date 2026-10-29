/*
  Warnings:

  - Added the required column `anchorDay` to the `RecurringInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RecurringInvoice" ADD COLUMN     "anchorDay" INTEGER NOT NULL;
