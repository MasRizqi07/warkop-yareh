import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { EventService } from '../../application/services/event.service';
import { paginate } from '../../../../common/interfaces/paginated-response.interface';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

@Controller('api/v1/events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async createEvent(
    @Body()
    body: {
      title: string;
      description?: string;
      branchId: string;
      date: string;
      startTime: string;
      endTime: string;
      location?: string;
      capacity: number;
      price?: number;
    },
  ) {
    const data = await this.eventService.createEvent(body);
    return { data };
  }

  @Get()
  async listEvents(
    @Query('branchId') branchId?: string,
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
  ) {
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 10;
    const { data, total } = await this.eventService.listEvents(
      branchId,
      page,
      limit,
    );
    return paginate(data, total, page, limit);
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
