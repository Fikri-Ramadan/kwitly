import { ArrayNotEmpty, IsArray, IsDate, IsIn, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';
import { InvoiceStatus } from "../../generated/prisma/enums.js";
import { PartialType } from "@nestjs/mapped-types";

export class CreateDto {
  @IsUUID()
  clientId: string;

  @IsDate()
  @Type(() => Date)
  issueDate: Date;

  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @IsOptional()
  @IsString()
  status?: InvoiceStatus;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  taxPercent?: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];
}

export class ItemDto {
  @IsUUID()
  productId: string;

  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;
}

export class UpdateDto extends PartialType(CreateDto) { }

export class StatusDto {
  @IsIn([InvoiceStatus.PENDING, InvoiceStatus.PAID, InvoiceStatus.CANCELLED])
  status: InvoiceStatus;
}