import * as argon from 'argon2';
import { AuthDto } from './dto';
import { PICTURE_API } from 'src/constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signUp(dto: AuthDto) {
    // hash the password
    const hash = await argon.hash(dto.password);

    try {
      // save user in the database
      const user = await this.prisma.user.create({
        data: {
          username: dto.username,
          password: hash,
          picture: `${PICTURE_API}${dto.username}`,
        },
      });

      // return the saved user
      return user;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('Duplicate Credentials!');
      }

      throw error;
    }
  }

  async signIn(dto: AuthDto) {
    // find user by username
    const user = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
    });

    if (!user) {
      throw new ForbiddenException('User does not exist!');
    }

    // compare password
    const isPasswordValid = await argon.verify(user.password, dto.password);

    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid Password!');
    }

    // send user
    return user;
  }
}
