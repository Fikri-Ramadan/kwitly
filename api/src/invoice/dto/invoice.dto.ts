import {
  ArrayNotEmpty, IsArray, IsBoolean, IsDate, IsEnum, IsIn, IsInt, IsNotEmpty, IsNumber,
  IsOptional, IsPositive, IsString, IsUUID, Max, MaxLength, Min, ValidateIf, ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Frequency, InvoiceStatus } from '../../generated/prisma/enums.js';
import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';

export class InvoiceItemDto {
  @ApiProperty({ example: 'uuid-product-123' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 'Web Development Services' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({ example: 1500000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice: number;
}

export class InvoiceCreateDto {
  @ApiProperty({ example: 'uuid-client-123' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ example: '2026-11-01' })
  @IsDate()
  @Type(() => Date)
  issueDate: Date;

  @ApiProperty({ example: '2026-11-15' })
  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @ApiPropertyOptional({ enum: [InvoiceStatus.DRAFT, InvoiceStatus.PENDING], example: 'DRAFT' })
  @IsOptional()
  @IsIn([InvoiceStatus.DRAFT, InvoiceStatus.PENDING])
  status?: InvoiceStatus;

  @ApiPropertyOptional({ example: 'Net 30' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  paymentTerms?: string;

  @ApiPropertyOptional({ example: 'Thank you for your business!' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ example: 11, description: 'Tax percentage (0-100)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  taxPercent?: number;

  @ApiPropertyOptional({ enum: Frequency, description: 'Setting this will enable recurring invoice generation' })
  @IsOptional()
  @IsEnum(Frequency)
  recurringFrequency?: Frequency | null;

  @ApiPropertyOptional({ example: '2027-01-01' })
  @ValidateIf(o => o.recurringFrequency)
  @IsNotEmpty({ message: 'recurringEndDate must be filled in if recurringFrequency is selected.' })
  @IsDate()
  @Type(() => Date)
  recurringEndDate?: Date;

  @ApiPropertyOptional({ example: true })
  @ValidateIf(o => o.recurringFrequency)
  @IsNotEmpty({ message: 'autoSend must be filled in if recurringFrequency is selected.' })
  @IsBoolean()
  autoSend?: boolean;

  @ApiPropertyOptional({ example: 7, description: 'How many days until the recurring invoice is due' })
  @ValidateIf(o => o.recurringFrequency)
  @IsNotEmpty({ message: 'dueInDays must be filled in if recurringFrequency is selected.' })
  @IsInt()
  @Min(0)
  dueInDays?: number;

  @ApiProperty({ type: [InvoiceItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}

export class InvoiceUpdateDto extends OmitType(PartialType(InvoiceCreateDto), [
  'status', 'recurringEndDate', 'autoSend', 'dueInDays',
] as const) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  recurringEndDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoSend?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  dueInDays?: number;
}

export class StatusDto {
  @ApiProperty({ enum: [InvoiceStatus.PENDING, InvoiceStatus.PAID, InvoiceStatus.CANCELLED] })
  @IsIn([InvoiceStatus.PENDING, InvoiceStatus.PAID, InvoiceStatus.CANCELLED])
  status: InvoiceStatus;
}

export class InvoiceFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isRecurring?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueStartDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueEndDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minTotal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxTotal?: number;

  @ApiPropertyOptional({ enum: ['issueDate', 'dueDate', 'total', 'number'] })
  @IsOptional()
  @IsString()
  @IsEnum(['issueDate', 'dueDate', 'total', 'number'])
  sortBy?: 'issueDate' | 'dueDate' | 'total' | 'number';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}