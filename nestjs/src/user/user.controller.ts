import { Controller, Get, UseGuards, Patch, Body } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtAuthGuard } from 'src/auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@GetUser('sub') userId: number) {
    return this.userService.getById(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  editUser(@GetUser('sub') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editById(userId, dto);
  }
}
