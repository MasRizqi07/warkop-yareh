import { Body, Controller, Get, Headers, Post, Query, UseGuards } from '@nestjs/common';
import { BookingService } from '../../application/services/booking.service';
import { BookingAvailabilityDto, BookingQuoteDto, CreateBookingDto } from '../dtos/booking.dto';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';
import { JwtAuthGuard } from '../../../../infrastructure/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/bookings')
export class BookingController {
  constructor(private readonly booking: BookingService) {}

  @Get('catalog')
  async catalog() { return { data: await this.booking.catalog() }; }

  @Get('availability')
  async availability(@Query() query: BookingAvailabilityDto) { return { data: await this.booking.availability(query.branchId, query.packageId, query.date) }; }

  @Post('quote')
  async quote(@Body() body: BookingQuoteDto) { return { data: await this.booking.quote(body.packageId, body.addonIds) }; }

  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateBookingDto, @Headers('idempotency-key') key?: string) { return { data: await this.booking.create(user.id, body, key ?? '') }; }
}
