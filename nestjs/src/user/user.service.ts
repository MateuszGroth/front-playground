import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    delete user.hash;

    return user;
  }

  async editById(id: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { ...dto },
    });

    delete user.hash;

    return user;
  }
}
