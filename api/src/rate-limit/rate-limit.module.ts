import { Global, Module } from '@nestjs/common';
import { RateLimitService } from './rate-limit.service.js';
import { APP_GUARD } from '@nestjs/core';
import { RateLimitGuard } from './rate-limit.guard.js';

@Global()
@Module({
  providers: [
    RateLimitService,
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard
    }
  ],
  exports: [RateLimitService]
})
export class RateLimitModule { }
