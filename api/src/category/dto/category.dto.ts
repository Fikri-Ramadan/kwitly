import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateDto extends PartialType(CreateDto) { }