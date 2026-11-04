import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CategoryCreateDto {
  @ApiProperty({
    example: 'Electronics',
    description: 'The name of the product category'
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CategoryUpdateDto extends PartialType(CategoryCreateDto) { }