import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingPolicyModule } from '../booking-policy/booking-policy.module';

@Module({
  imports: [BookingPolicyModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
