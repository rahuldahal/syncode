import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { signInDto, signUpDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PICTURE_API, duration, errorMessages } from 'src/constants';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService
  ) {}

  async signUp(dto: signUpDto) {
    // hash the password
    const hash = await argon.hash(dto.password);
    let picture = `${PICTURE_API}${dto.username}`;

    if (dto.firstname && dto.lastname) {
      picture = `${PICTURE_API}${dto.firstname}+${dto.lastname}`;
    }

    try {
      // save user in the database
      const user = await this.prisma.user.create({
        data: {
          username: dto.username,
          password: hash,
          picture,
          firstname: dto.firstname,
          lastname: dto.lastname,
        },
      });

      // return the JWT
      const accessToken = await this.signJWT(user.id, user.username);
      return { accessToken };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException(errorMessages.DUPLICATE_CREDENTIALS);
      }

      throw error;
    }
  }

  async signIn(dto: signInDto) {
    // find user by username
    const user = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
    });

    if (!user) {
      throw new ForbiddenException(errorMessages.NO_USER);
    }

    // compare password
    const isPasswordValid = await argon.verify(user.password, dto.password);

    if (!isPasswordValid) {
      throw new ForbiddenException(errorMessages.INVALID_PASSWORD);
    }

    // send JWT
    const accessToken = await this.signJWT(user.id, user.username);
    return { accessToken };
  }

  async signJWT(id: number, username: string): Promise<string> {
    const payload = {
      sub: id,
      username,
    };

    return this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: duration.FIFTEEEN_MINUTES,
    });
  }
}
