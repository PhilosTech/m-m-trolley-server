import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class AdminAddDto {
  @IsString()
  @MinLength(1)
  timeSlotId!: string;

  @IsString()
  @MinLength(1)
  participantName!: string;

  @IsInt()
  @Min(1)
  seats!: number;
}
