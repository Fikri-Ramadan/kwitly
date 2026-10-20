import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDto, UpdateDto } from './dto/client.dto.js';

@Injectable()
export class ClientService {

  constructor(
    private prisma: PrismaService,
  ) { }

  async findClientByUserId(userId: string) {
    return await this.prisma.client.findMany({
      where: { userId, deletedAt: null },
      orderBy: { name: 'asc' }
    });
  }

  async findClientById(clientId: string, userId: string) {
    return await this.isMyClient(clientId, userId);
  }

  async create(userId: string, data: CreateDto) {
    const existingClient = await this.prisma.client.findUnique({
      where: { userId_email: { userId, email: data.email } }
    });

    if (existingClient) {
      if (!existingClient.deletedAt)
        throw new ConflictException('This email already assigned to another active client.');

      return await this.prisma.client.update({
        where: { id: existingClient.id },
        data: {
          ...data,
          deletedAt: null,
        }
      });
    }

    return await this.prisma.client.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async update(
    clientId: string,
    userId: string,
    data: UpdateDto
  ) {
    const currentClient = await this.isMyClient(clientId, userId);
    if (data.email && data.email !== currentClient.email) {
      const conflict = await this.prisma.client.findUnique({
        where: { userId_email: { userId, email: data.email, } }
      });
      if (conflict) {
        if (!conflict.deletedAt)
          throw new ConflictException('This email already assigned to another active client.');

        await this.prisma.client.delete({
          where: { id: conflict.id }
        });
      }
    }

    return await this.prisma.client.update({
      where: { id: clientId },
      data: { ...data },
    });
  }

  async delete(clientId: string, userId: string) {
    await this.isMyClient(clientId, userId);
    return await this.prisma.client.update({
      where: { id: clientId, userId },
      data: { deletedAt: new Date() }
    });
  }

  async isMyClient(clientId: string, userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId, deletedAt: null }
    });
    if (!client || client.deletedAt) throw new NotFoundException('Client not found.');
    if (client.userId !== userId) throw new ForbiddenException(`You don't have permission to access this client.`);
    return client;
  }
}
