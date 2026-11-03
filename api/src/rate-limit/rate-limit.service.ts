import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

type Window = { limit: number; windowSeconds: number; };

export type RateLimitOptions = {
  scope: string;
  ip?: Window;
  email?: Window;
};

@Injectable()
export class RateLimitService {
  constructor(private prisma: PrismaService) { }

  async consume(key: string, { limit, windowSeconds }: Window) {
    const rows = await this.prisma.$queryRaw<{ hits: number; retryAfter: number; }[]>`
      INSERT INTO "RateLimit" ("key", "hits", "expiresAt")
      VALUES (${key}, 1, NOW() + (${windowSeconds}::double precision * INTERVAL '1 second'))
      ON CONFLICT ("key") DO UPDATE SET
        "hits" = CASE
          WHEN "RateLimit"."expiresAt" <= NOW() THEN 1
          ELSE "RateLimit"."hits" + 1
        END,
        "expiresAt" = CASE
          WHEN "RateLimit"."expiresAt" <= NOW()
            THEN NOW() + (${windowSeconds}::double precision * INTERVAL '1 second')
          ELSE "RateLimit"."expiresAt"
        END
      RETURNING
        "hits",
        CEIL(EXTRACT(EPOCH FROM ("RateLimit"."expiresAt" - NOW())))::int AS "retryAfter"
    `;

    const { hits, retryAfter } = rows[0];
    return { allowed: hits <= limit, retryAfter: Math.max(retryAfter, 1) };
  }

  async cleanUp() {
    const { count } = await this.prisma.rateLimit.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    });
    return count;
  }
}