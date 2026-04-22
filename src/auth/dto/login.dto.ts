import { IsIn, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsIn(['admin', 'participant'])
  role!: 'admin' | 'participant';

  @IsString()
  @MinLength(1)
  accessCode!: string;
}
