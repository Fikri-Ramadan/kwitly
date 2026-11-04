import { IsEmail, IsIn, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { OneTimeTokenValues } from '../auth.service.js';
import type { OneTimeType } from '../auth.service.js';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'budi@gmail.com', format: 'email', maxLength: 254 })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'budi12345', minLength: 7, format: 'password', maxLength: 128 })
  @IsString()
  @MinLength(7)
  @MaxLength(128)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'budi@gmail.com', format: 'email', maxLength: 254 })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'budi12345', minLength: 7, format: 'password', maxLength: 128 })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Token from a link in an email (single-use)' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'budi12345', minLength: 7, format: 'password', maxLength: 128 })
  @IsString()
  @MinLength(7)
  @MaxLength(128)
  password: string;
}

export class EmailDto {
  @ApiProperty({ example: 'budi@gmail.com', format: 'email', maxLength: 254 })
  @IsEmail()
  email: string;
}

export class TokenDto {
  @ApiProperty({
    description: 'A unique token (an encrypted, random string) sent via email or used for token rotation purposes.',
    example: 'd8f8a8b8-c8d8-e8f8-a8b8-c8d8e8f8a8b8'
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class SendMailDto {
  @ApiProperty({
    enum: OneTimeTokenValues,
    example: OneTimeTokenValues[0],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(OneTimeTokenValues)
  type: OneTimeType;

  @ApiProperty({ example: 'budi@gmail.com', format: 'email', maxLength: 254 })
  @IsEmail()
  email: string;
}

export class TokenResponseDto {
  @ApiProperty({
    description: 'JWT Access Token for accessing protected resources. Valid for 15 minutes.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken!: string;

  @ApiProperty({
    description: 'A refresh token is used to obtain a new access token without needing to log in again. It is single-use and valid for 7 days.',
    example: 'd8f8a8b8-c8d8-e8f8-a8b8-c8d8e8f8a8b8'
  })
  refreshToken!: string;

  @ApiProperty({
    example: 'Bearer',
    description: 'The type of authentication scheme used.'
  })
  tokenType!: string;

  @ApiProperty({
    example: 900,
    description: 'The remaining validity period of the access token, in seconds.'
  })
  expiresIn!: number;
}