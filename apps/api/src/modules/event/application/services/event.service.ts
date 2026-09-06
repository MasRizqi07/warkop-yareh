import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  EventCategory,
  EventRegistrationStatus,
  EventStatus,
  Prisma,
} from '@warkop-yareh/database';
import { randomBytes } from 'node:crypto';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

interface CreateEventInput {
  title: string;
  description?: string;
  branchId?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  capacity: number;
  price?: number;
  category?: EventCategory;
}

interface ListEventsInput {
  branchId?: string;
  category?: EventCategory;
  page: number;
  limit: number;
}

@Injectable()
export class EventService {
  constructor(private readonly prisma: DatabaseService) {}

  async createEvent(data: CreateEventInput) {
    if (!data.branchId) {
      throw new BadRequestException('Branch is required');
    }
    const date = this.parseEventDate(data.date);
    if (data.startTime >= data.endTime) {
      throw new BadRequestException('endTime must be later than startTime');
    }

    const branch = await this.prisma.branch.findFirst({
      where: { id: data.branchId, isActive: true, deletedAt: null },
      select: { id: true },
    });
    if (!branch) throw new BadRequestException('Branch is not active');

    const price = data.price ?? 0;
    const slugBase =
      data.title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'event';
    const slug = `${slugBase}-${data.date.replaceAll('-', '')}-${randomBytes(4).toString('hex')}`;
    return this.prisma.event.create({
      data: {
        title: data.title.trim(),
        slug,
        description: data.description?.trim() ?? '',
        branchId: data.branchId,
        date,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location?.trim() || 'Main Lounge',
        capacity: data.capacity,
        price,
        isFree: price === 0,
        category: data.category ?? EventCategory.COMMUNITY,
      },
    });
  }

  async listEvents(params: ListEventsInput) {
    const where: Prisma.EventWhereInput = {
      deletedAt: null,
      status: { in: [EventStatus.UPCOMING, EventStatus.ONGOING] },
      branch: { isActive: true, deletedAt: null },
      ...(params.branchId ? { branchId: params.branchId } : {}),
      ...(params.category ? { category: params.category } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: {
          _count: { select: { registrations: true } },
        },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { date: 'asc' },
      }),
      this.prisma.event.count({ where }),
    ]);
    return { data, total };
  }

  async registerForEvent(userId: string, eventId: string) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await this.prisma.withTenantTransaction(
          async (tx) => {
            await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${eventId}))`;
            const [event, user] = await Promise.all([
              tx.event.findFirst({
                where: {
                  id: eventId,
                  deletedAt: null,
                  branch: { isActive: true, deletedAt: null },
                },
              }),
              tx.user.findFirst({
                where: { id: userId, deletedAt: null },
                select: { id: true },
              }),
            ]);

            if (!event) throw new NotFoundException('Event not found');
            if (!user) throw new BadRequestException('User is not active');
            if (event.status !== EventStatus.UPCOMING) {
              throw new BadRequestException(
                'Only upcoming events accept registrations',
              );
            }
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            if (event.date < today) {
              throw new BadRequestException('Event registration has closed');
            }
            if (!event.isFree || event.price > 0) {
              throw new BadRequestException(
                'Paid event registration requires a payment flow',
              );
            }

            const registrationCount = await tx.eventRegistration.count({
              where: {
                eventId,
                status: {
                  in: [
                    EventRegistrationStatus.REGISTERED,
                    EventRegistrationStatus.ATTENDED,
                  ],
                },
              },
            });
            if (registrationCount >= event.capacity) {
              throw new BadRequestException('Event is fully booked');
            }

            const registration = await tx.eventRegistration.create({
              data: {
                userId,
                eventId,
                status: EventRegistrationStatus.REGISTERED,
              },
            });

            await tx.event.update({
              where: { id: eventId },
              data: { registered: registrationCount + 1 },
            });

            await tx.outboxEvent.create({
              data: {
                aggregateType: 'EventRegistration',
                aggregateId: registration.id,
                eventType: 'EventRegistered',
                payload: { registrationId: registration.id, eventId, userId },
              },
            });

            return registration;
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error: unknown) {
        const code = this.getPrismaErrorCode(error);
        if (code === 'P2002') {
          throw new ConflictException('Already registered for this event');
        }
        if (code === 'P2034' && attempt < 2) continue;
        if (code === 'P2034') {
          throw new ConflictException(
            'Event capacity changed concurrently; please try again',
          );
        }
        throw error;
      }
    }

    throw new ConflictException('Unable to register for this event');
  }

  async getEventBranchId(eventId: string): Promise<string> {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, deletedAt: null },
      select: { branchId: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event.branchId;
  }

  async listRegistrations(eventId: string) {
    return this.prisma.eventRegistration.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private parseEventDate(value: string): Date {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new BadRequestException('Event date must use YYYY-MM-DD format');
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      throw new BadRequestException('Event date is invalid');
    }
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (date < today) {
      throw new BadRequestException('Event date cannot be in the past');
    }
    return date;
  }

  private getPrismaErrorCode(error: unknown): string | undefined {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return error.code;
    }
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const code = Reflect.get(error, 'code');
      return typeof code === 'string' ? code : undefined;
    }
    return undefined;
  }
}
