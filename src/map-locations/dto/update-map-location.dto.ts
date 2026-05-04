import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateMapLocationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  positionNumber?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}

