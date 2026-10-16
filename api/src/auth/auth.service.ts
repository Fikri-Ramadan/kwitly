import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { MailService } from './mail.service.js';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';

type OneTimeType = 'EMAIL_VERIFY' | 'MAGIC_LINK' | 'FORGOT_PASS';
type TokenType = OneTimeType | 'REFRESH';

const BCRYPT_ROUNDS = 12;
const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 Hours
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days
const MAGIC_LINK_TTL_MS = 15 * 60 * 1000; // 15 Minutes
const FORGOT_PASS_TTL_MS = 60 * 60 * 1000; // 60 Minutes
export const ACCESS_TOKEN_TTL_S = 15 * 60; // 15 Minutes

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mailService: MailService
  ) { }

  async validateUser(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);
    if (pass !== user.password) throw new HttpException('Incorrect password', HttpStatus.BAD_REQUEST);
    const { password, ...result } = user;
    return result;
  }

  async requestMagicLink(email: string) {
    const user = await this.userService.upsert(email);
    await this.invalidateTokens(user.id, 'MAGIC_LINK');
    const token = await this.createToken(user.id, 'MAGIC_LINK', MAGIC_LINK_TTL_MS);
    await this.mailService.sendMagicLink(user.email, this.webLink('/verify-magic-link', token));
  }

  async verifyMagicLink(token: string) {
    const userId = await this.consumeToken(token, 'MAGIC_LINK');
    const user = await this.userService.findById(userId);
    if (!user.emailVerified) {
      await this.userService.markEmailVerifiedAndResetPassword(user.id);
    }
    return await this.issueSession(user);
  }

  async register(email: string, password: string) {
    const record = await this.userService.create(
      email,
      await bcrypt.hash(password, BCRYPT_ROUNDS),
    );
    const token = await this.createToken(record.id, 'EMAIL_VERIFY', EMAIL_VERIFY_TTL_MS);
    await this.mailService.sendVerification(record.email, this.webLink('/verify-email', token));
  }

  async verifyEmail(token: string) {
    const userId = await this.consumeToken(token, 'EMAIL_VERIFY');
    await this.userService.markEmailVerified(userId);
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    const valid = user?.password ?
      await bcrypt.compare(password, user.password) :
      (await bcrypt.hash(password, BCRYPT_ROUNDS), false);
    if (!valid) throw new BadRequestException('Invalid credentials.');
    if (!user.emailVerified) throw new BadRequestException('Email not yet verified.');

    return await this.issueSession(user);
  }

  async refresh(raw: string) {
    const invalid = new UnauthorizedException('The session has ended. Please log in again.');

    const record = await this.prisma.authToken.findUnique({
      where: { tokenHash: this.sha256(raw) },
      include: { user: true }
    });

    if (!record || record.type !== 'REFRESH' || record.expiresAt < new Date())
      throw invalid;

    if (record.usedAt) {
      if (record.familyId) await this.revokeFamily(record.familyId);
      throw invalid;
    }

    const { count } = await this.prisma.authToken.updateMany({
      where: { id: record.id, usedAt: null },
      data: { usedAt: new Date() }
    });
    if (count !== 1) throw invalid;

    return await this.issueSession(record.user, record.familyId ?? undefined);
  }

  async logout(raw: string) {
    const record = await this.prisma.authToken.findUnique({
      where: { tokenHash: this.sha256(raw) }
    });
    if (record?.type === 'REFRESH' && record.familyId)
      this.revokeFamily(record.familyId);
  }

  async requestResetPassword(email: string) {
    const user = await this.userService.findByEmail(email);
    await this.invalidateTokens(user.id, 'FORGOT_PASS')
    const token = await this.createToken(user.id, 'FORGOT_PASS', FORGOT_PASS_TTL_MS);
    await this.mailService.sendForgotLink(user.email, this.webLink('/forgot-password', token));
  }

  async resetPassword(token: string, password: string) {
    const userId = await this.consumeToken(token, 'FORGOT_PASS');
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword, emailVerified: true }
      }),
      this.prisma.authToken.updateMany({
        where: {
          userId, usedAt: null,
          type: { in: ['FORGOT_PASS', 'REFRESH', 'MAGIC_LINK'] }
        },
        data: { usedAt: new Date() }
      })
    ]);
    await this.userService.updatePassword(userId, hashedPassword);
  }

  private async issueSession(
    user: { id: string, email: string; },
    familyId: string = randomUUID()
  ) {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id, email: user.email
    });
    const refreshToken = await this.createToken(user.id, 'REFRESH', REFRESH_TTL_MS, familyId);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer' as const,
      expiresIn: ACCESS_TOKEN_TTL_S
    };
  }

  private async createToken(userId: string, type: TokenType, ttlMs: number, familyId?: string) {
    const raw = randomBytes(32).toString('base64url');
    await this.prisma.authToken.create({
      data: {
        userId,
        type,
        familyId,
        tokenHash: this.sha256(raw),
        expiresAt: new Date(Date.now() + ttlMs)
      }
    });
    return raw;
  }

  private async consumeToken(raw: string, type: OneTimeType) {
    const invalid = new BadRequestException('The token is invalid or has expired.');

    const record = await this.prisma.authToken.findUnique({
      where: { tokenHash: this.sha256(raw) }
    });

    if (!record || record.type !== type ||
      record.usedAt || record.expiresAt < new Date()
    ) throw invalid;

    const { count } = await this.prisma.authToken.updateMany({
      where: { tokenHash: this.sha256(raw), usedAt: null },
      data: { usedAt: new Date() }
    });

    if (count !== 1) throw invalid;
    return record.userId;
  }

  private async invalidateTokens(userId: string, type: TokenType) {
    await this.prisma.authToken.updateMany({
      where: { userId, type, usedAt: null },
      data: { usedAt: new Date() }
    });
  }

  private async revokeFamily(familyId: string) {
    await this.prisma.authToken.updateMany({
      where: { familyId, usedAt: null },
      data: { usedAt: new Date() }
    });
  }

  private sha256(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }

  private webLink(path: string, token: string) {
    const base = this.config.getOrThrow<string>('WEB_URL');
    return `${base}${path}?token=${encodeURIComponent(token)}`;
  }
}
