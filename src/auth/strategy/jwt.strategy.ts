import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

// verifies the JWT in the header

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'accessToken') {
  constructor(
    private prisma: PrismaService,
    config: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; username: string }) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      return null; // throws nestjs' unauthorized exception
    }

    // delete sensitive information
    delete user.password;

    return user;
  }
}
