import {
  ArrayNotEmpty, IsArray, IsBoolean, IsDate, IsEnum, IsIn, IsInt, IsNotEmpty, IsNumber,
  IsOptional, IsPositive, IsString, IsUUID, Max, MaxLength, Min, ValidateIf, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Frequency, InvoiceStatus } from '../../generated/prisma/enums.js';
import { OmitType, PartialType } from '@nestjs/mapped-types';

export class ItemDto {
  @IsUUID()
  productId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice: number;
}

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
  @IsIn([InvoiceStatus.DRAFT, InvoiceStatus.PENDING])
  status?: InvoiceStatus;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  paymentTerms?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  taxPercent?: number;

  @IsOptional()
  @IsEnum(Frequency)
  recurringFrequency?: Frequency | null;

  @ValidateIf(o => o.recurringFrequency)
  @IsNotEmpty({ message: 'recurringEndDate must be filled in if recurringFrequency is selected.' })
  @IsDate()
  @Type(() => Date)
  recurringEndDate?: Date;

  @ValidateIf(o => o.recurringFrequency)
  @IsNotEmpty({ message: 'autoSend must be filled in if recurringFrequency is selected.' })
  @IsBoolean()
  autoSend?: boolean;

  @ValidateIf(o => o.recurringFrequency)
  @IsNotEmpty({ message: 'dueInDays must be filled in if recurringFrequency is selected.' })
  @IsInt()
  @Min(0)
  dueInDays?: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];
}

export class UpdateDto extends OmitType(PartialType(CreateDto), [
  'status', 'recurringEndDate', 'autoSend', 'dueInDays',
] as const) {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  recurringEndDate?: Date;

  @IsOptional()
  @IsBoolean()
  autoSend?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  dueInDays?: number;
}

export class StatusDto {
  @IsIn([InvoiceStatus.PENDING, InvoiceStatus.PAID, InvoiceStatus.CANCELLED])
  status: InvoiceStatus;
}