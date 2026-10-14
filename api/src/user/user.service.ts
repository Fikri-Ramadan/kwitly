import { ConflictException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async create(email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new ConflictException('Email is already in use');
    return await this.prisma.user.create({
      data: {
        email,
        password,
        profile: {
          create: {
            fullName: email.split('@')[0]
          }
        }
      },
    });
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

  async markEmailVerified(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { emailVerified: true }
    });
  }
}
