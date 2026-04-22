import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locations: LocationsService) {}

  @Roles('admin', 'participant')
  @Get()
  list() {
    return this.locations.listAll();
  }

  @Roles('admin', 'participant')
  @Get(':locationId/schedule')
  schedule(@Param('locationId') locationId: string) {
    return this.locations.getSchedule(locationId);
  }

  @Roles('admin')
  @Post()
  create(@Body() dto: CreateLocationDto) {
    return this.locations.create(dto);
  }

  @Roles('admin')
  @Patch(':locationId')
  update(
    @Param('locationId') locationId: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.locations.update(locationId, dto);
  }

  @Roles('admin')
  @Delete(':locationId')
  remove(@Param('locationId') locationId: string) {
    return this.locations.delete(locationId);
  }
}
