import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  googleMapsUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];
}
