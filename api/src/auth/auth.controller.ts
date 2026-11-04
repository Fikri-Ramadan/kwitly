import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { EmailDto, ForgotPasswordDto, LoginDto, RegisterDto, SendMailDto, TokenDto, TokenResponseDto } from './dto/auth.dto.js';
import { Public } from '../common/decorator/public.decorator.js';
import { RateLimit } from '../common/decorator/rate-limit.decorator.js';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

const MIN = 60;
const HOUR = 60 * MIN;

@ApiTags('Authentication')
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) { }

  @RateLimit({ scope: 'register', ip: { limit: 5, windowSeconds: HOUR } })
  @Post('register')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Register a new account',
    description: 'Sending a verification email that is valid for 24 hours.',
  })
  @ApiResponse({ status: 201, description: 'Registration successful; please check your email.' })
  @ApiResponse({ status: 409, description: 'The email is already registered.' })
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.register(registerDto.email, registerDto.password);
    return { message: 'Registration successfully. Check email for verify account.' };
  }

  @RateLimit({ scope: 'verify-email', ip: { limit: 20, windowSeconds: 15 * MIN } })
  @Post('verify-email')
  @ApiOperation({ summary: 'Email Verification', description: 'Verify the account using a token from an email.' })
  @ApiResponse({ status: 200, description: 'Email successfully verified.' })
  @ApiResponse({ status: 401, description: 'Token is invalid or expired.' })
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
  @ApiOperation({ summary: 'Request Magic Link', description: 'Send an instant login link to the email—no password required.' })
  @ApiResponse({ status: 200, description: 'The magic link has been sent successfully.' })
  async requestMagicLink(@Body() { email }: EmailDto) {
    await this.authService.requestMagicLink(email);
    return { message: 'The link has been sent successfully. Please check your email.' };
  }

  @RateLimit({ scope: 'magic-verify', ip: { limit: 20, windowSeconds: 15 * MIN } })
  @Post('verify-magic-link')
  @ApiOperation({ summary: 'Verify Magic Link', description: 'Log in using a magic link token.' })
  @ApiResponse({ status: 200, type: TokenResponseDto, description: 'Login successful.' })
  async verifyMagicLink(@Body() { token }: TokenDto) {
    return await this.authService.verifyMagicLink(token);
  }

  @RateLimit({
    scope: 'login',
    ip: { limit: 20, windowSeconds: 15 * MIN },
    email: { limit: 5, windowSeconds: 15 * MIN },
  })
  @Post('login')
  @ApiOperation({ summary: 'Traditional Login', description: 'Log in using your email and password.' })
  @ApiResponse({ status: 200, type: TokenResponseDto, description: 'Login successful.' })
  @ApiResponse({ status: 400, description: 'Incorrect credentials.' })
  async login(@Body() loginDto: LoginDto): Promise<TokenResponseDto> {
    return await this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout', description: 'Revoke the refresh token.' })
  @ApiResponse({ status: 200, description: 'Logout successful.' })
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
  @ApiOperation({ summary: 'Forgot the password', description: 'Send a password reset link to the email.' })
  @ApiResponse({ status: 200, description: 'The link has been sent successfully.' })
  async requestResetPassword(@Body() { email }: EmailDto) {
    await this.authService.requestResetPassword(email);
    return { message: 'The link has been sent successfully. Please check your email.' };
  }

  @RateLimit({ scope: 'reset-password', ip: { limit: 10, windowSeconds: 15 * MIN } })
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset Password', description: 'Changing the password using a reset token.' })
  @ApiResponse({ status: 200, description: 'Password successfully changed.' })
  async resetPassword(@Body() { token, password }: ForgotPasswordDto) {
    await this.authService.resetPassword(token, password);
    return { message: 'Password successfully changed. Please log in.' };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh Token', description: 'Obtaining a new access token using a refresh token.' })
  @ApiResponse({ status: 200, type: TokenResponseDto })
  async refresh(@Body() { token }: TokenDto) {
    return await this.authService.refresh(token);
  }

  @RateLimit({
    scope: 'send-email',
    ip: { limit: 1, windowSeconds: MIN },
    email: { limit: 1, windowSeconds: MIN },
  })
  @Post('send-mail')
  @ApiOperation({ summary: 'Resend Email', description: 'Resend the verification email, magic link or forgot password.' })
  async sendMail(@Body() { type, email }: SendMailDto) {
    await this.authService.resendMail(type, email);
    return { message: 'The link has been sent successfully. Please check your email.' };
  }
}
