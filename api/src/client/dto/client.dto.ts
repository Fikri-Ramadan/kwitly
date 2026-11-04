import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";

export class ClientCreateDto {
  @ApiProperty({ example: 'Budi Raharjo' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'budi.client@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '08123456789' })
  @IsOptional()
  @IsNumberString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Jl. Merdeka No. 10' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 14, description: 'Payment due date (days)' })
  @IsOptional()
  @IsNumber()
  paymentTermDays?: number;

  @ApiPropertyOptional({ example: 'Bank Transfer' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

export class ClientUpdateDto extends PartialType(ClientCreateDto) { }