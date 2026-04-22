import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReserveDto } from './dto/reserve.dto';
import { AdminAddDto } from './dto/admin-add.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Roles('participant')
  @Post('reserve')
  reserve(@Body() dto: ReserveDto) {
    return this.bookings.reserve('participant', dto);
  }

  @Roles('admin')
  @Post('admin')
  adminAdd(@Body() dto: AdminAddDto) {
    return this.bookings.adminAdd(dto);
  }

  @Roles('admin')
  @Delete(':bookingId')
  remove(@Param('bookingId') bookingId: string) {
    return this.bookings.deleteBooking(bookingId);
  }
}
