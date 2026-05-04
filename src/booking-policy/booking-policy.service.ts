import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type BookingPolicyDto = {
  isGlobalLocked: boolean;
  lockedLocationIds: string[];
  mapPhotoUrl: string | null;
};

function parseLockedIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === 'string');
}

@Injectable()
export class BookingPolicyService {
  constructor(private readonly prisma: PrismaService) {}

  async getPolicy(): Promise<BookingPolicyDto> {
    const row = await this.prisma.bookingPolicyState.findUniqueOrThrow({
      where: { id: 1 },
    });
    return {
      isGlobalLocked: row.isGlobalLocked,
      lockedLocationIds: parseLockedIds(row.lockedLocationIds),
      mapPhotoUrl: row.mapPhotoUrl ?? null,
    };
  }

  async setGlobalLocked(isLocked: boolean): Promise<BookingPolicyDto> {
    await this.prisma.bookingPolicyState.update({
      where: { id: 1 },
      data: { isGlobalLocked: isLocked },
    });
    return this.getPolicy();
  }

  async setLocationLocked(
    locationId: string,
    isLocked: boolean,
  ): Promise<BookingPolicyDto> {
    const row = await this.prisma.bookingPolicyState.findUniqueOrThrow({
      where: { id: 1 },
    });
    const set = new Set(parseLockedIds(row.lockedLocationIds));
    if (isLocked) set.add(locationId);
    else set.delete(locationId);
    await this.prisma.bookingPolicyState.update({
      where: { id: 1 },
      data: { lockedLocationIds: Array.from(set) },
    });
    return this.getPolicy();
  }

  async setMapPhotoUrl(mapPhotoUrl: string | null): Promise<BookingPolicyDto> {
    await this.prisma.bookingPolicyState.update({
      where: { id: 1 },
      data: { mapPhotoUrl },
    });
    return this.getPolicy();
  }

  async assertBookingAllowed(timeSlotId: string): Promise<void> {
    const policy = await this.getPolicy();
    if (policy.isGlobalLocked) {
      throw new Error('Adding participants is closed.');
    }
    const slot = await this.prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
      select: { locationId: true },
    });
    if (!slot) return;
    if (policy.lockedLocationIds.includes(slot.locationId)) {
      throw new Error('Adding participants is closed for this place.');
    }
  }
}
