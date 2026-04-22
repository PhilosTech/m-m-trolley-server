import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateSlotDto } from './dto/create-slot.dto';

@Controller()
export class SlotsController {
  constructor(private readonly locations: LocationsService) {}

  @Roles('admin')
  @Post('locations/:locationId/slots')
  create(@Param('locationId') locationId: string, @Body() dto: CreateSlotDto) {
    return this.locations.createSlot(locationId, dto);
  }

  @Roles('admin')
  @Post('slots/:timeSlotId/clear')
  clear(@Param('timeSlotId') timeSlotId: string) {
    return this.locations.clearSlot(timeSlotId);
  }

  @Roles('admin')
  @Delete('slots/:timeSlotId')
  remove(@Param('timeSlotId') timeSlotId: string) {
    return this.locations.deleteSlot(timeSlotId);
  }
}
