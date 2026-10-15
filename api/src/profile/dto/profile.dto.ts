import { IsNumberString, IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateDto {
  @IsString()
  @IsOptional()
  fullName: string;

  @IsString()
  @IsOptional()
  company: string;

  @IsNumberString()
  @IsOptional()
  phone: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsUrl()
  @IsOptional()
  logoUrl: string;
}