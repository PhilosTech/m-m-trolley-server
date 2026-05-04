import { IsOptional, IsString } from 'class-validator';

export class SetMapPhotoDto {
  /**
   * Data URL string (e.g. "data:image/png;base64,...") or empty string to clear.
   * We keep it as string to avoid multipart for this MVP.
   */
  @IsOptional()
  @IsString()
  mapPhotoUrl?: string;
}

