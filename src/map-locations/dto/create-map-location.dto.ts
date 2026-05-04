import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateMapLocationDto {
  @IsInt()
  @Min(1)
  positionNumber!: number;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}

