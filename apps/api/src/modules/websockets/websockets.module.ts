import { Global, Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { AuthModule } from '../../infrastructure/auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class WebsocketsModule {}
