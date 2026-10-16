import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RateLimitOptions, RateLimitService } from "./rate-limit.service.js";
import { RATE_LIMIT_KEY } from "../common/decorator/rate-limit.decorator.js";

type Headers = Record<string, string | string[] | undefined>;
type RequestLike = {
  headers: Headers;
  body?: { email?: unknown; };
  ip?: string;
  socket?: { remoteAddress?: string; };
};

function clientIp(req: RequestLike) {
  const header = (name: string) => {
    const v = req.headers[name];
    return Array.isArray(v) ? v[0] : v;
  };

  const raw =
    header('x-vercel-forwarded-for') ??
    header('x-forwarded-for') ??
    req.ip ??
    req.socket?.remoteAddress ??
    'unknown';

  return raw.split(',')[0].trim() || 'unknown';
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private limiter: RateLimitService
  ) { }

  async canActivate(ctx: ExecutionContext) {
    const options = this.reflector.get<RateLimitOptions | undefined>(
      RATE_LIMIT_KEY,
      ctx.getHandler()
    );

    if (!options) return true;

    const http = ctx.switchToHttp();
    const req = http.getRequest<RequestLike>();
    const checks: Promise<{ allowed: boolean; retryAfter: number; }>[] = [];

    if (options.ip) {
      checks.push(this.limiter.consume(`${options.scope}:ip:${clientIp(req)}`, options.ip));
    }

    const email = req.body?.email;
    if (options.email && typeof email === 'string') {
      const normalized = email.trim().toLowerCase().slice(0, 254);
      checks.push(this.limiter.consume(`${options.scope}:email:${normalized}`, options.email));
    }

    const blocked = (await Promise.all(checks)).filter(r => !r.allowed);
    if (blocked.length > 0) {
      const retryAfter = Math.max(...blocked.map((r) => r.retryAfter));
      http
        .getResponse<{ setHeader(name: string, value: string): void; }>()
        .setHeader('Retry-After', String(retryAfter));
      throw new HttpException(`Too many attempts. Try again in ${Math.ceil(retryAfter / 60)} minutes.`,
        HttpStatus.TOO_MANY_REQUESTS,);
    }

    return true;
  }
}