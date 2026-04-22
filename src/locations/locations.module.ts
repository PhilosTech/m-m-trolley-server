import { Module } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { SlotsController } from './slots.controller';
import { LocationsService } from './locations.service';

@Module({
  controllers: [LocationsController, SlotsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
