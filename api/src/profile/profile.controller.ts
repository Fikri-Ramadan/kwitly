import { Body, Controller, Get, Put } from '@nestjs/common';
import { ProfileService } from './profile.service.js';
import { User } from '../common/decorator/user.decorator.js';
import { UpdateDto } from './dto/profile.dto.js';

@Controller('profile')
export class ProfileController {
  constructor(
    private profileService: ProfileService
  ) { }

  @Get()
  async me(@User() user: { sub: string; }) {
    return await this.profileService.getById(user.sub);
  }

  @Put()
  async updateMyProfile(
    @User() user: { sub: string, email: string; },
    @Body() updateDto: UpdateDto
  ) {
    return await this.profileService.update(user.sub, { ...updateDto });
  }
}
