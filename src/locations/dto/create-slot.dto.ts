import { IsDateString, IsInt, Min } from 'class-validator';

export class CreateSlotDto {
  @IsDateString()
  startTimeIso!: string;

  @IsDateString()
  endTimeIso!: string;

  @IsInt()
  @Min(1)
  capacity!: number;
}
