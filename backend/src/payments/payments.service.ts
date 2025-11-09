import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private creditsService: CreditsService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-11-20.acacia',
    });
  }

  async createPaymentIntent(
    userId: string,
    amount: number,
    type: 'ORDER' | 'CREDIT_PURCHASE',
    metadata?: any,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'eur',
      metadata: {
        userId,
        type,
        ...metadata,
      },
    });

    // Create Payment record
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        type,
        amount,
        stripePaymentIntentId: paymentIntent.id,
        status: 'PENDING',
        metadata,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
    };
  }

  async handleWebhook(signature: string, rawBody: Buffer) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!payment) {
      console.error('Payment not found for PaymentIntent', paymentIntent.id);
      return;
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCEEDED',
        stripeChargeId: paymentIntent.latest_charge as string,
      },
    });

    // If it's a credit purchase, add credits to user
    if (payment.type === 'CREDIT_PURCHASE') {
      const creditsToAdd = Number(payment.amount) * 100; // 1€ = 100 crédits
      await this.creditsService.addCredits(
        payment.userId,
        creditsToAdd,
        'PURCHASE',
        {
          paymentId: payment.id,
          description: `Purchased ${creditsToAdd} credits`,
        },
      );
    }

    // If it's an order, update order status
    if (payment.type === 'ORDER' && payment.orderId) {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!payment) {
      return;
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    });
  }

  async getCreditPackages() {
    return [
      { credits: 1000, price: 10, bonus: 0 },
      { credits: 2500, price: 20, bonus: 500 },
      { credits: 5000, price: 40, bonus: 1500 },
      { credits: 10000, price: 75, bonus: 5000 },
      { credits: 25000, price: 150, bonus: 15000 },
    ];
  }
}
