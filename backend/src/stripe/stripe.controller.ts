import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  /**
   * Get available credit packages
   */
  @Get('packages')
  getPackages() {
    return this.stripeService.getPackages();
  }

  /**
   * Create a payment intent to purchase credits
   */
  @Post('create-payment-intent')
  @UseGuards(JwtAuthGuard)
  async createPaymentIntent(
    @Request() req,
    @Body('packageId') packageId: string,
  ) {
    return this.stripeService.createPaymentIntent(req.user.id, packageId);
  }

  /**
   * Stripe webhook endpoint
   * IMPORTANT: This route must have raw body access
   */
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    const rawBody = request.rawBody;

    if (!rawBody) {
      throw new Error('Raw body is required for Stripe webhooks');
    }

    return this.stripeService.handleWebhook(signature, rawBody);
  }

  /**
   * Get payment history for authenticated user
   */
  @Get('payments')
  @UseGuards(JwtAuthGuard)
  async getUserPayments(@Request() req) {
    return this.stripeService.getUserPayments(req.user.id);
  }

  /**
   * Get a specific payment
   */
  @Get('payments/:id')
  @UseGuards(JwtAuthGuard)
  async getPayment(@Request() req, @Body('paymentId') paymentId: string) {
    return this.stripeService.getPayment(paymentId, req.user.id);
  }
}
