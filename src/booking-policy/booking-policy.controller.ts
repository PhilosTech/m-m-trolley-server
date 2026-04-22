import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { BookingPolicyService } from './booking-policy.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { SetGlobalLockDto } from './dto/set-global-lock.dto';
import { SetLocationLockDto } from './dto/set-location-lock.dto';

@Controller('booking-policy')
export class BookingPolicyController {
  constructor(private readonly policy: BookingPolicyService) {}

  @Public()
  @Get()
  getPublic() {
    return this.policy.getPolicy();
  }

  @Roles('admin')
  @Patch('global')
  setGlobal(@Body() dto: SetGlobalLockDto) {
    return this.policy.setGlobalLocked(dto.isLocked);
  }

  @Roles('admin')
  @Patch('locations/:locationId')
  setLocation(
    @Param('locationId') locationId: string,
    @Body() dto: SetLocationLockDto,
  ) {
    return this.policy.setLocationLocked(locationId, dto.isLocked);
  }
}
