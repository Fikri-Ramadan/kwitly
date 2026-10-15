import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';
import { User } from './common/decorator/user.decorator.js';
import { Public } from './common/decorator/public.decorator.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private prisma: PrismaService
  ) { }

  @Public()
  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('profile')
  getProfile(@User() user: any) {
    return { data: user };
  }

  @Get('health/db')
  async db() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { db: 'ok' };
  }
}
