import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get('credit-packages')
  @ApiOperation({ summary: 'Get available credit packages' })
  async getCreditPackages() {
    return this.paymentsService.getCreditPackages();
  }

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment intent' })
  async createPaymentIntent(
    @Request() req,
    @Body() body: { amount: number; type: 'ORDER' | 'CREDIT_PURCHASE'; metadata?: any },
  ) {
    return this.paymentsService.createPaymentIntent(
      req.user.userId,
      body.amount,
      body.type,
      body.metadata,
    );
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.paymentsService.handleWebhook(signature, req.rawBody);
  }
}
