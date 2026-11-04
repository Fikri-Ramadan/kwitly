import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString, IsUrl } from "class-validator";

export class ProfileUpdateDto {
  @ApiPropertyOptional({
    description: `User's full name`,
    example: 'Budiono Siregar'
  })
  @IsString()
  @IsOptional()
  fullName: string;

  @ApiPropertyOptional({
    description: 'Company name',
    example: 'PT. Kapal Merdeka'
  })
  @IsString()
  @IsOptional()
  company: string;

  @ApiPropertyOptional({
    description: 'Active phone number',
    example: '081321321321'
  })
  @IsNumberString()
  @IsOptional()
  phone: string;

  @ApiPropertyOptional({
    description: 'Complete address',
    example: 'JL. Ciptomulyo 4 no.10'
  })
  @IsString()
  @IsOptional()
  address: string;

  @ApiPropertyOptional({
    description: 'Company logo URL',
    example: 'https://cdn.com/logo.png'
  })
  @IsUrl()
  @IsOptional()
  logoUrl: string;
}