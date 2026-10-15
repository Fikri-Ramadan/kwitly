import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
  ) { }

  async getById(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId: id }
    });
    if (!profile) throw new BadRequestException('Profile not found.');
    return profile;
  }

  async update(
    id: string,
    data: {
      fullName?: string;
      company?: string;
      phone?: string;
      address?: string;
      logoUrl?: string;
    }
  ) {
    return await this.prisma.profile.update({
      where: { userId: id },
      data: { ...data },
      select: {
        fullName: true,
        company: true,
        phone: true,
        address: true,
        logoUrl: true
      }
    });
  }
}
