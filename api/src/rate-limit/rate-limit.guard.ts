import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { RateLimitOptions, RateLimitService } from "./rate-limit.service.js";
import { RATE_LIMIT_KEY } from "../common/decorator/rate-limit.decorator.js";
import { timingSafeEqual } from "node:crypto";
import { isIPv4, isIPv6 } from "node:net";

type Headers = Record<string, string | string[] | undefined>;
type RequestLike = {
  headers: Headers;
  body?: { email?: unknown; };
  ip?: string;
  socket?: { remoteAddress?: string; };
};
type ResponseLike = { setHeader(name: string, value: string): void; };

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

const toArray = <T>(v?: T | T[]): T[] =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

function bucketIp(raw: string) {
  const ip = raw.split('%')[0].trim().toLowerCase();
  if (isIPv4(ip)) return ip;
  if (!isIPv6(ip)) return 'unknown';

  const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return mapped[1];

  const [head, tail] = ip.split('::');
  const h = head ? head.split(':') : [];
  const t = tail ? tail.split(':') : [];
  const groups = ip.includes('::')
    ? [...h, ...Array(Math.max(8 - h.length - t.length, 0)).fill('0'), ...t]
    : h;
  return groups.slice(0, 4).map((g) => parseInt(g || '0', 16).toString(16)).join(':') + '::/64';
}

function clientIp(req: RequestLike, internalSecret?: string) {
  const header = (name: string) => {
    const v = req.headers[name];
    return Array.isArray(v) ? v[0] : v;
  };

  // request from BFF (Next.js)
  const secret = header('x-internal-secret');
  const forwarded = header('x-client-ip');
  if (internalSecret && secret && forwarded && safeEqual(secret, internalSecret))
    return bucketIp(forwarded);

  // request from (browser, or BFF without valid secret)
  const raw =
    header('x-vercel-forwarded-for') ?? header('x-forwarded-for') ??
    req.ip ?? req.socket?.remoteAddress ?? 'unknown';
  return bucketIp(raw.split(',')[0]);
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly internalSecret?: string;

  constructor(
    private reflector: Reflector,
    private limiter: RateLimitService,
    config: ConfigService,
  ) {
    this.internalSecret = config.get<string>('INTERNAL_API_SECRET');
    if (!this.internalSecret)
      this.logger.warn('INTERNAL_API_SECRET not set: IPs forwarded by the BFF will be ignored.');
  }

  async canActivate(ctx: ExecutionContext) {
    const options = this.reflector.getAllAndOverride<RateLimitOptions | undefined>(
      RATE_LIMIT_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (!options) return true;

    const http = ctx.switchToHttp();
    const req = http.getRequest<RequestLike>();

    const ip = clientIp(req, this.internalSecret);
    const rawEmail = req.body?.email;
    const email =
      typeof rawEmail === 'string'
        ? rawEmail.trim().toLowerCase().slice(0, 254)
        : undefined;

    const checks = [
      ...toArray(options.ip).map((w) => ({
        key: `${options.scope}:ip:${ip}:${w.windowSeconds}`,
        w,
      })),
      ...(email
        ? toArray(options.email).map((w) => ({
          key: `${options.scope}:email:${email}:${w.windowSeconds}`,
          w,
        }))
        : []),
    ].sort((a, b) => a.w.windowSeconds - b.w.windowSeconds); // window pendek dulu

    for (const { key, w } of checks) {
      const r = await this.limiter.consume(key, w);
      if (!r.allowed) this.reject(http.getResponse<ResponseLike>(), r.retryAfter);
    }
    return true;
  }

  private reject(res: ResponseLike, seconds: number): never {
    res.setHeader('Retry-After', String(seconds));
    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: `Too many attempts. Try again in ${seconds} seconds.`,
        seconds,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}