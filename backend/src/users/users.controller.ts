import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user info' })
  async getMe(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update profile' })
  async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get user statistics' })
  async getStats(@Request() req) {
    return this.usersService.getStats(req.user.userId);
  }

  @Get('me/referrals')
  @ApiOperation({ summary: 'Get user referrals' })
  async getReferrals(@Request() req) {
    return this.usersService.getReferrals(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (public profile)' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
