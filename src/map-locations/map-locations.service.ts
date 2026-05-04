import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateMapLocationDto } from './dto/create-map-location.dto';
import type { UpdateMapLocationDto } from './dto/update-map-location.dto';

export type MapLocationDraftDto = {
  id: string;
  positionNumber: number;
  title: string;
  photoUrl: string | null;
};

function mapRow(row: {
  id: string;
  positionNumber: number;
  title: string;
  photoUrl: string | null;
}): MapLocationDraftDto {
  return {
    id: row.id,
    positionNumber: row.positionNumber,
    title: row.title,
    photoUrl: row.photoUrl,
  };
}

@Injectable()
export class MapLocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<MapLocationDraftDto[]> {
    const rows = await this.prisma.mapLocationDraft.findMany({
      orderBy: [{ positionNumber: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map(mapRow);
  }

  async create(dto: CreateMapLocationDto): Promise<MapLocationDraftDto> {
    const positionNumber = dto.positionNumber;
    const title = dto.title?.trim() ?? '';
    const photoUrl = dto.photoUrl?.trim() || null;
    try {
      const row = await this.prisma.mapLocationDraft.create({
        data: { positionNumber, title, photoUrl },
      });
      return mapRow(row);
    } catch (e: unknown) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Position number is already used.');
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdateMapLocationDto): Promise<MapLocationDraftDto> {
    const prev = await this.prisma.mapLocationDraft.findUnique({ where: { id } });
    if (!prev) throw new NotFoundException('Map location not found.');

    const data: Prisma.MapLocationDraftUpdateInput = {};
    if (dto.positionNumber !== undefined) data.positionNumber = dto.positionNumber;
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.photoUrl !== undefined) {
      const next = dto.photoUrl.trim();
      data.photoUrl = next.length ? next : null;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No changes provided.');
    }

    try {
      const row = await this.prisma.mapLocationDraft.update({ where: { id }, data });
      return mapRow(row);
    } catch (e: unknown) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Position number is already used.');
      }
      throw e;
    }
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const prev = await this.prisma.mapLocationDraft.findUnique({ where: { id } });
    if (!prev) throw new NotFoundException('Map location not found.');
    await this.prisma.mapLocationDraft.delete({ where: { id } });
    return { deleted: true };
  }
}

