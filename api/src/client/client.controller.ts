import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { User } from '../common/decorator/user.decorator.js';
import { ClientService } from './client.service.js';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClientCreateDto, ClientUpdateDto } from './dto/client.dto.js';

@ApiTags('Clients')
@ApiBearerAuth()
@Controller('client')
export class ClientController {

  constructor(private clientService: ClientService) { }

  @Get()
  @ApiOperation({ summary: 'Getting all my clients', description: 'Retrieve a list of all active (non-deleted) clients belonging to the user.' })
  @ApiResponse({ status: 200, description: 'List of clients successfully retrieved.' })
  async getMyClients(@User() user: { sub: string; }) {
    return await this.clientService.findClientByUserId(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve client details by ID' })
  @ApiParam({ name: 'id', description: 'The UUID of the client' })
  @ApiResponse({ status: 200, description: 'Client details found.' })
  @ApiResponse({ status: 404, description: 'Client not found or does not belong to you.' })
  async getClientById(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: { sub: string; }
  ) {
    return await this.clientService.findClientById(id, user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Adding a new client' })
  @ApiResponse({ status: 200, description: 'Client successfully created.' })
  @ApiResponse({ status: 409, description: 'The email client is already registered (active).' })
  async createClient(
    @User() user: { sub: string; },
    @Body() createDto: ClientCreateDto
  ) {
    return await this.clientService.create(user.sub, { ...createDto });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Updating client data' })
  @ApiParam({ name: 'id', description: 'The UUID of the client' })
  @ApiResponse({ status: 200, description: 'Client data has been successfully updated.' })
  async updateClient(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: { sub: string; },
    @Body() updateDto: ClientUpdateDto
  ) {
    return await this.clientService.update(id, user.sub, { ...updateDto });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deleting a client (Soft Delete)' })
  @ApiParam({ name: 'id', description: 'The UUID of the client' })
  @ApiResponse({ status: 200, description: 'Client successfully deleted.' })
  async deleteClient(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: { sub: string; }
  ) {
    await this.clientService.delete(id, user.sub);
    return { message: 'Client successfully deleted.' };
  }
}
