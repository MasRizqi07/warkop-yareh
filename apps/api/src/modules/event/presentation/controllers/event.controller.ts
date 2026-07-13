import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { EventService } from '../../application/services/event.service';
import { paginate } from '../../../../common/interfaces/paginated-response.interface';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { CreateEventDto } from '../dtos/event.dto';
import { Public } from '../../../../common/decorators/public.decorator';
import { tenantContext } from '../../../../infrastructure/database/tenant-context';

@Controller('api/v1/events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async createEvent(@Body() body: CreateEventDto) {
    const data = await this.eventService.createEvent(body);
    return { data };
  }

  @Get()
  @Public()
  async listEvents(
    @Query('branchId') branchId?: string,
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
  ) {
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 10;
    
    // Evaluate the list query under the specified read-only tenant context so that RLS isolates
    // events to ONLY the given branch (or fails/returns empty if the branch doesn't exist).
    // The query executes gracefully through the standard database service middleware.
    return new Promise((resolve, reject) => {
      tenantContext.run({ branchId, userId: undefined, role: undefined }, async () => {
        try {
          const { data, total } = await this.eventService.listEvents(
            branchId,
            page,
            limit,
          );
          resolve(paginate(data, total, page, limit));
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  @Post(':eventId/register')
  async registerForEvent(
    @Param('eventId') eventId: string,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.eventService.registerForEvent(userId, eventId);
    return { data };
  }

  @Get(':eventId/registrations')
  async listRegistrations(@Param('eventId') eventId: string) {
    const data = await this.eventService.listRegistrations(eventId);
    return { data };
  }
}
