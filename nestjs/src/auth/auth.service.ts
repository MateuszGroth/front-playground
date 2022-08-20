import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signin(dto: AuthDto) {
    // find user by email
    // if user does not exist throw exception
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    // compare password hash with password hash from database
    const passwordMatches = await argon.verify(user.hash, dto.password);
    // if password hashes do not match throw exception
    if (!passwordMatches) {
      throw new ForbiddenException('Invalid credentials');
    }

    return this.signToken(user.id, user.email);
  }

  async signup(dto: AuthDto) {
    // generate password hash
    const hash = await argon.hash(dto.password);
    // save user

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
        // select: {
        //   id: true,
        //   email: true,
        //   createdAt: true,
        // },
      });

      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already exists');
        }
      }
    }

    return {};
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{
    user: { id: number; email: string };
    access_token: string;
    expires_in: number;
  }> {
    const payload = {
      sub: userId,
      email,
    };

    const expiresIn = 1000 * 60 * 60; // 1hour

    const token = await this.jwt.signAsync(payload, {
      expiresIn,
      secret: this.config.get('JWT_SECRET'),
    });

    return {
      user: {
        id: userId,
        email,
      },
      expires_in: expiresIn,
      access_token: token,
    };
  }
}

type test = {
  user: {
    email: string;
    id: number;
  };
  expiresIn: number;
};