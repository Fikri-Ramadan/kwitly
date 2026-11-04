import { Body, Controller, Get, Put } from '@nestjs/common';
import { ProfileService } from './profile.service.js';
import { User } from '../common/decorator/user.decorator.js';
import { ProfileUpdateDto } from './dto/profile.dto.js';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
  constructor(
    private profileService: ProfileService
  ) { }

  @Get()
  @ApiOperation({
    summary: 'Retrieving my profile',
    description: 'Retrieve the full profile details of the currently logged-in user (including address, phone number, and company).'
  })
  @ApiResponse({
    status: 200,
    description: 'Profile data successfully retrieved.'
  })
  @ApiResponse({ status: 401, description: 'Unauthorized: Token is invalid or expired.' })
  @ApiResponse({ status: 404, description: 'Profile not found.' })
  async me(@User() user: { sub: string; }) {
    return await this.profileService.getById(user.sub);
  }

  @Put()
  @ApiOperation({
    summary: 'Updating my profile',
    description: 'Updating profile information such as full name, company, phone number, and address.'
  })
  @ApiResponse({ status: 200, description: 'Profile successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request: Data validation failed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Token is invalid or expired.' })
  async updateMyProfile(
    @User() user: { sub: string, email: string; },
    @Body() updateDto: ProfileUpdateDto
  ) {
    return await this.profileService.update(user.sub, { ...updateDto });
  }
}
