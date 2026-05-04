import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMapLocationDto } from './dto/create-map-location.dto';
import { UpdateMapLocationDto } from './dto/update-map-location.dto';
import { MapLocationsService } from './map-locations.service';

@Controller('map-locations')
export class MapLocationsController {
  constructor(private readonly mapLocations: MapLocationsService) {}

  @Roles('admin')
  @Get()
  list() {
    return this.mapLocations.list();
  }

  @Roles('admin')
  @Post()
  create(@Body() dto: CreateMapLocationDto) {
    return this.mapLocations.create(dto);
  }

  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMapLocationDto) {
    return this.mapLocations.update(id, dto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mapLocations.delete(id);
  }
}

