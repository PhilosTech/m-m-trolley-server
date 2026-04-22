import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LocationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateLocationDto } from './dto/create-location.dto';
import type { UpdateLocationDto } from './dto/update-location.dto';

export type LocationDto = {
  id: string;
  title: string;
  googleMapsUrl?: string;
  photoUrls: string[];
  description?: string;
  status: 'draft' | 'published';
};

export type TimeSlotDto = {
  id: string;
  locationId: string;
  startTimeIso: string;
  endTimeIso: string;
  capacity: number;
};

export type BookingDto = {
  id: string;
  timeSlotId: string;
  participantName: string;
  seats: number;
  createdAtIso: string;
};

export type SlotWithBookingDto = {
  slot: TimeSlotDto;
  bookedSeats: number;
  bookings: BookingDto[];
};

function asStringArray(json: unknown): string[] {
  if (!Array.isArray(json)) return [];
  return json.filter((x): x is string => typeof x === 'string');
}

const DEFAULT_MAX_PHOTO_DATA_URL_CHARS = 28 * 1024 * 1024;

function resolveMaxPhotoDataUrlChars(): number {
  const raw = process.env.MAX_PHOTO_DATA_URL_CHARS;
  if (raw === undefined || raw === '') return DEFAULT_MAX_PHOTO_DATA_URL_CHARS;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_MAX_PHOTO_DATA_URL_CHARS;
  return n;
}

function assertPhotoUrlsPayloadSize(photoUrls: unknown): void {
  if (!Array.isArray(photoUrls)) {
    throw new BadRequestException('photoUrls must be an array of strings.');
  }
  const maxChars = resolveMaxPhotoDataUrlChars();
  const maxMb = Math.round(maxChars / (1024 * 1024));
  for (const url of photoUrls) {
    if (typeof url !== 'string') {
      throw new BadRequestException('Each photo URL must be a string.');
    }
    if (url.length > maxChars) {
      throw new BadRequestException(
        `Photo is too large (encoded size exceeds ${maxMb} MB). Use a smaller image or lower resolution.`,
      );
    }
  }
}

function mapLocation(row: {
  id: string;
  title: string;
  googleMapsUrl: string | null;
  photoUrls: unknown;
  description: string | null;
  status: LocationStatus;
}): LocationDto {
  return {
    id: row.id,
    title: row.title,
    googleMapsUrl: row.googleMapsUrl ?? undefined,
    photoUrls: asStringArray(row.photoUrls),
    description: row.description ?? undefined,
    status: row.status === 'published' ? 'published' : 'draft',
  };
}

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listAll(): Promise<LocationDto[]> {
    const rows = await this.prisma.location.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(mapLocation);
  }

  async create(dto: CreateLocationDto): Promise<LocationDto> {
    const photoUrls = dto.photoUrls ?? [];
    assertPhotoUrlsPayloadSize(photoUrls);
    const row = await this.prisma.location.create({
      data: {
        title: dto.title?.trim() ?? '',
        googleMapsUrl: dto.googleMapsUrl?.trim() || undefined,
        description: dto.description?.trim() || undefined,
        photoUrls,
        status: LocationStatus.draft,
      },
    });
    return mapLocation(row);
  }

  private isOnlyStatusUpdate(dto: UpdateLocationDto): boolean {
    return (
      (dto.status === 'draft' || dto.status === 'published') &&
      dto.title === undefined &&
      dto.googleMapsUrl === undefined &&
      dto.description === undefined &&
      dto.photoUrls === undefined
    );
  }

  private async assertLocationEditable(locationId: string): Promise<void> {
    const loc = await this.prisma.location.findUnique({
      where: { id: locationId },
    });
    if (!loc) throw new NotFoundException('Location not found.');
    if (loc.status === LocationStatus.published) {
      throw new ForbiddenException(
        'This place is published. Unpublish it to make changes.',
      );
    }
  }

  async update(
    locationId: string,
    dto: UpdateLocationDto,
  ): Promise<LocationDto> {
    const prev = await this.prisma.location.findUnique({
      where: { id: locationId },
    });
    if (!prev) throw new NotFoundException('Location not found.');

    if (!this.isOnlyStatusUpdate(dto)) {
      await this.assertLocationEditable(locationId);
    }

    if (dto.photoUrls !== undefined) {
      assertPhotoUrlsPayloadSize(dto.photoUrls);
    }

    const next = await this.prisma.location.update({
      where: { id: locationId },
      data: {
        title: dto.title !== undefined ? dto.title.trim() : prev.title,
        googleMapsUrl:
          dto.googleMapsUrl !== undefined
            ? dto.googleMapsUrl.trim() === ''
              ? null
              : dto.googleMapsUrl.trim()
            : prev.googleMapsUrl,
        description:
          dto.description !== undefined
            ? dto.description.trim() || null
            : prev.description,
        photoUrls:
          dto.photoUrls !== undefined
            ? (dto.photoUrls as Prisma.InputJsonValue)
            : (prev.photoUrls as Prisma.InputJsonValue),
        status:
          dto.status === 'draft' || dto.status === 'published'
            ? dto.status === 'published'
              ? LocationStatus.published
              : LocationStatus.draft
            : prev.status,
      },
    });
    return mapLocation(next);
  }

  async delete(locationId: string): Promise<{ deleted: boolean }> {
    await this.assertLocationEditable(locationId);
    await this.prisma.location.delete({ where: { id: locationId } });
    return { deleted: true };
  }

  async getSchedule(locationId: string): Promise<SlotWithBookingDto[]> {
    const loc = await this.prisma.location.findUnique({
      where: { id: locationId },
    });
    if (!loc) throw new NotFoundException('Location not found.');

    const slots = await this.prisma.timeSlot.findMany({
      where: { locationId },
      orderBy: { startTime: 'asc' },
      include: {
        bookings: true,
      },
    });

    return slots.map((s) => {
      const bookedSeats = s.bookings.reduce((acc, b) => acc + b.seats, 0);
      return {
        slot: {
          id: s.id,
          locationId: s.locationId,
          startTimeIso: s.startTime.toISOString(),
          endTimeIso: s.endTime.toISOString(),
          capacity: s.capacity,
        },
        bookedSeats,
        bookings: s.bookings.map((b) => ({
          id: b.id,
          timeSlotId: b.timeSlotId,
          participantName: b.participantName,
          seats: b.seats,
          createdAtIso: b.createdAt.toISOString(),
        })),
      };
    });
  }

  async createSlot(
    locationId: string,
    input: { startTimeIso: string; endTimeIso: string; capacity: number },
  ): Promise<TimeSlotDto> {
    await this.assertLocationEditable(locationId);
    const loc = await this.prisma.location.findUnique({
      where: { id: locationId },
    });
    if (!loc) throw new NotFoundException('Location not found.');

    const start = Date.parse(input.startTimeIso);
    const end = Date.parse(input.endTimeIso);
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      throw new BadRequestException('Invalid start/end time.');
    }
    if (!(end > start)) {
      throw new BadRequestException('End time must be after start time.');
    }
    if (!Number.isInteger(input.capacity) || input.capacity <= 0) {
      throw new BadRequestException('Capacity must be a positive integer.');
    }

    const slot = await this.prisma.timeSlot.create({
      data: {
        locationId,
        startTime: new Date(start),
        endTime: new Date(end),
        capacity: input.capacity,
      },
    });
    return {
      id: slot.id,
      locationId: slot.locationId,
      startTimeIso: slot.startTime.toISOString(),
      endTimeIso: slot.endTime.toISOString(),
      capacity: slot.capacity,
    };
  }

  async clearSlot(timeSlotId: string): Promise<{ cleared: number }> {
    const slot = await this.prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
    });
    if (!slot) throw new NotFoundException('Time slot not found.');
    await this.assertLocationEditable(slot.locationId);

    const res = await this.prisma.booking.deleteMany({ where: { timeSlotId } });
    return { cleared: res.count };
  }

  async deleteSlot(timeSlotId: string): Promise<{ deleted: boolean }> {
    const slot = await this.prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
    });
    if (!slot) throw new NotFoundException('Time slot not found.');
    await this.assertLocationEditable(slot.locationId);

    await this.prisma.booking.deleteMany({ where: { timeSlotId } });
    await this.prisma.timeSlot.delete({ where: { id: timeSlotId } });
    return { deleted: true };
  }
}
