import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserService } from '../user/user.service.js';

@Injectable()
export class ClientService {

  constructor(
    private prisma: PrismaService,
    private userService: UserService
  ) { }

  async findClientByUserId(userId: string) {
    return await this.prisma.client.findMany({
      where: { userId, deletedAt: null }
    });
  }

  async create(
    userId: string,
    data: {
      name: string, email: string,
      phone?: string, address?: string, paymentTermDays?: number, paymentMethod?: string;
    }
  ) {
    const user = await this.userService.findById(userId);
    const existingEmail = await this.prisma.client.findFirst({
      where: {
        userId,
        email: data.email,
        deletedAt: null,
      }
    });
    if (existingEmail) throw new ConflictException('Email already sign to another client.');
    return await this.prisma.client.create({
      data: {
        userId: user.id,
        ...data
      },
    });
  }

  async update(
    clientId: string,
    userId: string,
    data: {
      name?: string, email?: string,
      phone?: string, address?: string,
      paymentTermDays?: number, paymentMethod?: string;
    }
  ) {
    const myClient = await this.prisma.client.findUnique({
      where: { id: clientId, userId }
    });
    if (!myClient) throw new BadRequestException('Invalid client id or unauthorize.')
    if (data?.email) {
      const existingEmail = await this.prisma.client.findFirst({
        where: {
          userId,
          email: data.email,
          id: { not: clientId }
        }
      });

      if (existingEmail) throw new ConflictException('Email already sign to another client.');
    }
    return await this.prisma.client.update({
      where: { id: clientId, userId },
      data: { ...data },
    });
  }
}
