import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';
import { Public } from './common/decorator/public.decorator.js';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private prisma: PrismaService
  ) { }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Hello World!' })
  getHello() {
    return this.appService.getHello();
  }

  @ApiBearerAuth()
  @Get('health/db')
  @ApiOperation({ summary: 'Database connection status' })
  async db() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { db: 'ok' };
  }
}
