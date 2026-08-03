import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

@Injectable()
export class EventService {
  constructor(private readonly prisma: DatabaseService) {}

  async createEvent(data: {
    title: string;
    description?: string;
    branchId: string;
    date: string;
    startTime: string;
    endTime: string;
    location?: string;
    capacity: number;
    price?: number;
  }) {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return this.prisma.event.create({
      data: {
        title: data.title,
        slug,
        description: data.description || '',
        branchId: data.branchId,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location || 'Main Lounge',
        capacity: data.capacity,
        price: data.price || 0,
      },
    });
  }

  async listEvents(branchId?: string, page: number = 1, limit: number = 10) {
    const where = branchId ? { branchId } : {};
    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: {
          _count: { select: { registrations: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'asc' },
      }),
      this.prisma.event.count({ where }),
    ]);
    return { data, total };
  }

  async registerForEvent(userId: string, eventId: string) {
    return this.prisma.$transaction(
      async (tx: any) => {
        const event = await tx.event.findUnique({
          where: { id: eventId },
        });

        if (!event) {
          throw new NotFoundException('Event not found');
        }

        const registrationCount = await tx.eventRegistration.count({
          where: { eventId, status: 'REGISTERED' },
        });

        if (registrationCount >= event.capacity) {
          throw new BadRequestException('Event is fully booked');
        }

        try {
          const registration = await tx.eventRegistration.create({
            data: {
              userId,
              eventId,
              status: 'REGISTERED',
            },
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
        } catch (error: any) {
          if (error?.code === 'P2002') {
            throw new ConflictException('Already registered for this event');
          }
          throw error;
        }
      },
      { isolationLevel: 'Serializable' },
    );
  }

  async listRegistrations(eventId: string) {
    return this.prisma.eventRegistration.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
