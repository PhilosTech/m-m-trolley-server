import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingPolicyService } from '../booking-policy/booking-policy.service';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly policy: BookingPolicyService,
  ) {}

  async reserve(
    role: 'participant',
    input: { timeSlotId: string; participantName: string; seats: number },
  ) {
    if (role !== 'participant') {
      throw new ForbiddenException('Participant access required.');
    }
    try {
      await this.policy.assertBookingAllowed(input.timeSlotId);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Booking not allowed.';
      throw new BadRequestException(msg);
    }

    const name = input.participantName.trim();
    if (name.length < 1) throw new BadRequestException('Name is required.');
    if (!Number.isInteger(input.seats) || input.seats <= 0) {
      throw new BadRequestException('Seats must be a positive integer.');
    }

    return this.prisma.$transaction(async (tx) => {
      const slot = await tx.timeSlot.findUnique({
        where: { id: input.timeSlotId },
        include: { bookings: true },
      });
      if (!slot) throw new NotFoundException('Time slot not found.');

      const bookedSeats = slot.bookings.reduce((acc, b) => acc + b.seats, 0);
      const free = slot.capacity - bookedSeats;
      if (free < input.seats) {
        throw new BadRequestException('Not enough free seats.');
      }

      const booking = await tx.booking.create({
        data: {
          timeSlotId: slot.id,
          participantName: name,
          seats: input.seats,
        },
      });
      return {
        id: booking.id,
        timeSlotId: booking.timeSlotId,
        participantName: booking.participantName,
        seats: booking.seats,
        createdAtIso: booking.createdAt.toISOString(),
      };
    });
  }

  async adminAdd(input: {
    timeSlotId: string;
    participantName: string;
    seats: number;
  }) {
    try {
      await this.policy.assertBookingAllowed(input.timeSlotId);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Booking not allowed.';
      throw new BadRequestException(msg);
    }

    const name = input.participantName.trim();
    if (name.length < 1) throw new BadRequestException('Name is required.');
    if (!Number.isInteger(input.seats) || input.seats <= 0) {
      throw new BadRequestException('Seats must be a positive integer.');
    }

    return this.prisma.$transaction(async (tx) => {
      const slot = await tx.timeSlot.findUnique({
        where: { id: input.timeSlotId },
        include: { bookings: true },
      });
      if (!slot) throw new NotFoundException('Time slot not found.');

      const bookedSeats = slot.bookings.reduce((acc, b) => acc + b.seats, 0);
      const free = slot.capacity - bookedSeats;
      if (free < input.seats) {
        throw new BadRequestException('Not enough free seats.');
      }

      const booking = await tx.booking.create({
        data: {
          timeSlotId: slot.id,
          participantName: name,
          seats: input.seats,
        },
      });
      return {
        id: booking.id,
        timeSlotId: booking.timeSlotId,
        participantName: booking.participantName,
        seats: booking.seats,
        createdAtIso: booking.createdAt.toISOString(),
      };
    });
  }

  async deleteBooking(bookingId: string): Promise<{ deleted: boolean }> {
    const b = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!b) throw new NotFoundException('Booking not found.');
    await this.prisma.booking.delete({ where: { id: bookingId } });
    return { deleted: true };
  }
}
