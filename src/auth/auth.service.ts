import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { AppRole } from './decorators/roles.decorator';

export type JwtPayload = { sub: string; role: AppRole };

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  login(
    role: AppRole,
    accessCode: string,
  ): { role: AppRole; accessToken: string } {
    const adminCode = this.config.get<string>('ADMIN_ACCESS_CODE', 'ADMIN2026');
    const participantCode = this.config.get<string>(
      'PARTICIPANT_ACCESS_CODE',
      'PARTICIPANT2026',
    );
    const expected = role === 'admin' ? adminCode : participantCode;
    if (accessCode.trim() !== expected) {
      throw new UnauthorizedException('Invalid access code.');
    }
    const payload: JwtPayload = { sub: role, role };
    const accessToken = this.jwt.sign(payload);
    return { role, accessToken };
  }
}
