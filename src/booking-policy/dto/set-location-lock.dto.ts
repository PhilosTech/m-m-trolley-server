import { IsBoolean } from 'class-validator';

export class SetLocationLockDto {
  @IsBoolean()
  isLocked!: boolean;
}
