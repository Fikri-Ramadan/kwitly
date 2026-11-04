import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class ProductCreateDto {
  @ApiProperty({ example: 'uuid-category-123', description: 'The UUID of the category' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 'Web Development', description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Create landing page with SEO Optimizer', description: 'Detailed product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 80, description: 'Product price' })
  @IsNumber()
  @Min(0)
  price: number;
}

export class ProductUpdateDto extends PartialType(ProductCreateDto) { }