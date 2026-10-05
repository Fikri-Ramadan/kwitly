import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private prisma: PrismaService
  ) { }

  @Get()
  getHello() {
    return { message: 'hello world' };
  }

  @Get('profile')
  getProfile() {
    return {message: 'This is endpoint profile'}
  }

  @Get('health/db')
  async db() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { db: 'ok' };
  }
}
