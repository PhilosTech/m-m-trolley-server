import { Module } from '@nestjs/common';
import { BookingPolicyController } from './booking-policy.controller';
import { BookingPolicyService } from './booking-policy.service';

@Module({
  controllers: [BookingPolicyController],
  providers: [BookingPolicyService],
  exports: [BookingPolicyService],
})
export class BookingPolicyModule {}
