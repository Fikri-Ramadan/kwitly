import { Module } from '@nestjs/common';
import { ClientService } from './client.service.js';
import { ClientController } from './client.controller.js';
import { UserModule } from '../user/user.module.js';

@Module({
  imports: [UserModule],
  providers: [ClientService],
  controllers: [ClientController]
})
export class ClientModule {}
