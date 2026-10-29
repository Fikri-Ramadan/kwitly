/*
  Warnings:

  - Made the column `productId` on table `InvoiceItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "InvoiceItem" ALTER COLUMN "productId" SET NOT NULL;
