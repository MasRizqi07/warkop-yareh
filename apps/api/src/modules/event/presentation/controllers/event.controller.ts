import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Role } from '@warkop-yareh/database';
import { EventService } from '../../application/services/event.service';
import { paginate } from '../../../../common/interfaces/paginated-response.interface';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { CreateEventDto, ListEventsQueryDto } from '../dtos/event.dto';
import { Public } from '../../../../common/decorators/public.decorator';
import { tenantContext } from '../../../../infrastructure/database/tenant-context';
import { Roles } from '../../../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';
import {
  assertBranchAccess,
  resolveManagedBranch,
} from '../../../../common/authorization/branch-access';

@Controller('api/v1/events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @Roles(Role.MANAGER, Role.ADMIN, Role.OWNER, Role.SUPERADMIN)
  async createEvent(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateEventDto,
  ) {
    const branchId = resolveManagedBranch(user, body.branchId);
    const data = await this.eventService.createEvent({ ...body, branchId });
    return { data };
  }

  @Get()
  @Public()
  async listEvents(@Query() query: ListEventsQueryDto) {
    return tenantContext.run({ branchId: query.branchId }, async () => {
      const { data, total } = await this.eventService.listEvents(query);
      return paginate(data, total, query.page, query.limit);
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
  @Roles(Role.MANAGER, Role.ADMIN, Role.OWNER, Role.SUPERADMIN)
  async listRegistrations(
    @Param('eventId') eventId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const branchId = await this.eventService.getEventBranchId(eventId);
    assertBranchAccess(user, branchId);
    const data = await this.eventService.listRegistrations(eventId);
    return { data };
  }
}
