import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { User } from '../common/decorator/user.decorator.js';
import { ClientService } from './client.service.js';
import { CreateDto, UpdateDto } from './dto/client.dto.js';

@Controller('client')
export class ClientController {

  constructor(private clientService: ClientService) { }

  @Get()
  async getMyClients(@User() user: { sub: string; }) {
    return await this.clientService.findClientByUserId(user.sub);
  }

  @Get(':id')
  async getClientById(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: { sub: string; }
  ) {
    return await this.clientService.findClientById(id, user.sub);
  }

  @Post()
  async createClient(
    @User() user: { sub: string; },
    @Body() createDto: CreateDto
  ) {
    return await this.clientService.create(
      user.sub,
      {
        name: createDto.name,
        email: createDto.email,
        phone: createDto.phone,
        address: createDto.address,
        paymentTermDays: createDto.paymentTermDays,
        paymentMethod: createDto.paymentMethod
      }
    );
  }

  @Put(':id')
  async updateClient(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: { sub: string; },
    @Body() updateDto: UpdateDto
  ) {
    return await this.clientService.update(
      id,
      user.sub,
      {
        name: updateDto.name,
        email: updateDto.email,
        phone: updateDto.phone,
        address: updateDto.address,
        paymentTermDays: updateDto.paymentTermDays,
        paymentMethod: updateDto.paymentMethod
      }
    );
  }

  @Delete(':id')
  async deleteClient(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: { sub: string; }
  ) {
    await this.clientService.delete(id, user.sub);
    return {message: 'Client successfully deleted.'}
  }
}
