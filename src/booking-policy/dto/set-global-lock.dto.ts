import { IsBoolean } from 'class-validator';

export class SetGlobalLockDto {
  @IsBoolean()
  isLocked!: boolean;
}
