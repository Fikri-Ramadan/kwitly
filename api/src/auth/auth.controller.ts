import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { EmailDto, ForgotPasswordDto, LoginDto, RegisterDto, SendMailDto, TokenDto } from './dto/auth.dto.js';
import { Public } from '../common/decorator/public.decorator.js';
import { RateLimit } from '../common/decorator/rate-limit.decorator.js';

const MIN = 60;
const HOUR = 60 * MIN;

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) { }

  @RateLimit({ scope: 'register', ip: { limit: 5, windowSeconds: HOUR } })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.register(registerDto.email, registerDto.password);
    return { message: 'Registration successfully. Check email for verify account.' };
  }

  @RateLimit({ scope: 'verify-email', ip: { limit: 20, windowSeconds: 15 * MIN } })
  @Post('verify-email')
  async verifyEmail(@Body() { token }: TokenDto) {
    await this.authService.verifyEmail(token);
    return { message: 'Email successfully verified. Please log in.' };
  }

  @RateLimit({
    scope: 'magic-link',
    ip: { limit: 10, windowSeconds: 15 * MIN },
    email: { limit: 3, windowSeconds: 15 * MIN },
  })
  @Post('magic-link')
  async requestMagicLink(@Body() { email }: EmailDto) {
    await this.authService.requestMagicLink(email);
    return { message: 'The link has been sent successfully. Please check your email.' };
  }

  @RateLimit({ scope: 'magic-verify', ip: { limit: 20, windowSeconds: 15 * MIN } })
  @Post('verify-magic-link')
  async verifyMagicLink(@Body() { token }: TokenDto) {
    return await this.authService.verifyMagicLink(token);
  }

  @RateLimit({
    scope: 'login',
    ip: { limit: 20, windowSeconds: 15 * MIN },
    email: { limit: 5, windowSeconds: 15 * MIN },
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('logout')
  async logout(@Body() { token }: TokenDto) {
    await this.authService.logout(token);
    return { message: 'Logout successfully.' };
  }

  @RateLimit({
    scope: 'forgot-password',
    ip: { limit: 10, windowSeconds: HOUR },
    email: { limit: 3, windowSeconds: HOUR },
  })
  @Post('forgot-password')
  async requestResetPassword(@Body() { email }: EmailDto) {
    await this.authService.requestResetPassword(email);
    return { message: 'The link has been sent successfully. Please check your email.' };
  }

  @RateLimit({ scope: 'reset-password', ip: { limit: 10, windowSeconds: 15 * MIN } })
  @Post('reset-password')
  async resetPassword(@Body() { token, password }: ForgotPasswordDto) {
    await this.authService.resetPassword(token, password);
    return { message: 'Password successfully changed. Please log in.' };
  }

  @Post('refresh')
  async refresh(@Body() { token }: TokenDto) {
    return await this.authService.refresh(token);
  }

  @RateLimit({
    scope: 'send-email',
    ip: { limit: 1, windowSeconds: MIN },
    email: { limit: 1, windowSeconds: MIN },
  })
  @Post('send-mail')
  async sendMail(@Body() { type, email }: SendMailDto) {
    await this.authService.resendMail(type, email);
    return { message: 'The link has been sent successfully. Please check your email.' };
  }
}
