import { IsEmail, IsIn, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { OneTimeTokenValues } from '../auth.service.js';
import type { OneTimeType } from '../auth.service.js';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(7)
  @MaxLength(128)
  password: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(7)
  @MaxLength(128)
  password: string;
}

export class EmailDto {
  @IsEmail()
  email: string;
}

export class TokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}


export class SendMailDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(OneTimeTokenValues)
  type: OneTimeType;

  @IsEmail()
  email: string;
}