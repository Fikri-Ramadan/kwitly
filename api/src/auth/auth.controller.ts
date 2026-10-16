import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { EmailDto, ForgotPasswordDto, LoginDto, RegisterDto, TokenDto } from './dto/auth.dto.js';
import { Public } from '../common/decorator/public.decorator.js';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.register(registerDto.email, registerDto.password);
    return { message: 'Registration successfully. Check email for verify account.' };
  }

  @Post('magic-link')
  async requestMagicLink(@Body() { email }: EmailDto) {
    await this.authService.requestMagicLink(email);
    return { message: 'The link has been sent successfully. Please check your email.' };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('logout')
  async logout(@Body() { token }: TokenDto) {
    await this.authService.logout(token);
    return { message: 'Logout successfully.' };
  }

  @Post('forgot-password')
  async requestResetPassword(@Body() { email }: EmailDto) {
    await this.authService.requestResetPassword(email);
    return { message: 'The link has been sent successfully. Please check your email.' };
  }

  @Post('reset-password')
  async resetPassword(@Body() { token, password }: ForgotPasswordDto) {
    await this.authService.resetPassword(token, password);
    return { message: 'Password successfully changed. Please log in.' }
  }

  @Post('refresh')
  async refresh(@Body() { token }: TokenDto) {
    return await this.authService.refresh(token);
  }

  @Post('verify-email')
  async verifyEmail(@Body() { token }: TokenDto) {
    await this.authService.verifyEmail(token);
    return { message: 'Email successfully verified. Please log in.' };
  }

  @Post('verify-magic-link')
  async verifyMagicLink(@Body() { token }: TokenDto) {
    return await this.authService.verifyMagicLink(token);
  }
}
