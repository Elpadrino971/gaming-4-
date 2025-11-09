import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VipService } from './vip.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('vip')
@Controller('vip')
export class VipController {
  constructor(private vipService: VipService) {}

  @Get('benefits')
  @ApiOperation({ summary: 'Get VIP benefits and pricing' })
  async getBenefits() {
    return this.vipService.getVipBenefits();
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user VIP subscription status' })
  async getStatus(@Request() req) {
    return this.vipService.getSubscriptionStatus(req.user.userId);
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe to VIP' })
  async subscribe(
    @Request() req,
    @Body() body: { paymentMethodId: string },
  ) {
    return this.vipService.createSubscription(
      req.user.userId,
      body.paymentMethodId,
    );
  }

  @Delete('cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel VIP subscription' })
  async cancel(@Request() req) {
    return this.vipService.cancelSubscription(req.user.userId);
  }
}
