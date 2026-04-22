import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { AppRole } from './decorators/roles.decorator';
import type { JwtPayload } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'dev-change-me'),
    });
  }

  validate(payload: JwtPayload): { role: AppRole; userId: string } {
    if (payload.role !== 'admin' && payload.role !== 'participant') {
      throw new UnauthorizedException();
    }
    return { role: payload.role, userId: payload.sub };
  }
}
