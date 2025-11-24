import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import Stripe from 'stripe';
import { Prisma } from '@prisma/client';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  // Credit Packages (100 credits = 1€)
  private readonly packages = {
    STARTER: { credits: 500, price: 4.99, priceId: process.env.STRIPE_PRICE_STARTER },
    BASIC: { credits: 1000, price: 9.99, priceId: process.env.STRIPE_PRICE_BASIC },
    POPULAR: { credits: 2500, price: 19.99, priceId: process.env.STRIPE_PRICE_POPULAR },
    PREMIUM: { credits: 5000, price: 39.99, priceId: process.env.STRIPE_PRICE_PREMIUM },
    MEGA: { credits: 10000, price: 74.99, priceId: process.env.STRIPE_PRICE_MEGA },
  };

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private creditsService: CreditsService,
  ) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2024-12-18.acacia',
    });
  }

  /**
   * Get available credit packages
   */
  getPackages() {
    return Object.entries(this.packages).map(([key, pkg]) => ({
      id: key,
      credits: pkg.credits,
      price: pkg.price,
      pricePerCredit: (pkg.price / pkg.credits).toFixed(4),
      bonus: key === 'POPULAR' ? '+500 crédits bonus' : key === 'MEGA' ? '+1500 crédits bonus' : null,
    }));
  }

  /**
   * Create a payment intent for purchasing credits
   */
  async createPaymentIntent(userId: string, packageId: string) {
    const pkg = this.packages[packageId];

    if (!pkg) {
      throw new BadRequestException('Invalid package');
    }

    // Create payment record in database
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        type: 'CREDIT_PURCHASE',
        status: 'PENDING',
        amount: new Prisma.Decimal(pkg.price),
        currency: 'EUR',
        metadata: {
          packageId,
          credits: pkg.credits,
        },
      },
    });

    // Create Stripe PaymentIntent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(pkg.price * 100), // Convert to cents
      currency: 'eur',
      metadata: {
        userId,
        paymentId: payment.id,
        packageId,
        credits: pkg.credits.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
      description: `Achat de ${pkg.credits} crédits BingoShop`,
    });

    // Update payment with Stripe intent ID
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
      credits: pkg.credits,
      amount: pkg.price,
    };
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(signature: string, rawBody: Buffer) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.succeeded':
        // Additional confirmation
        console.log('[STRIPE] Charge succeeded:', event.data.object.id);
        break;

      default:
        console.log(`[STRIPE] Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const { userId, paymentId, credits } = paymentIntent.metadata;

    if (!userId || !paymentId || !credits) {
      console.error('[STRIPE] Missing metadata in payment intent:', paymentIntent.id);
      return;
    }

    // Update payment status
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'SUCCEEDED',
        stripeChargeId: paymentIntent.latest_charge as string,
      },
    });

    // Add credits to user
    const creditsAmount = parseInt(credits);
    await this.creditsService.addCredits(userId, creditsAmount, 'PURCHASE', {
      paymentId,
      description: `Achat de ${creditsAmount} crédits`,
      metadata: {
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert back to EUR
      },
    });

    // Create notification
    await this.prisma.notification.create({
      data: {
        userId,
        type: 'CREDITS_RECEIVED',
        title: '💰 Crédits reçus !',
        message: `Vous avez reçu ${creditsAmount} crédits. Merci pour votre achat !`,
        link: '/dashboard',
      },
    });

    console.log(`[STRIPE] Payment successful: User ${userId} received ${creditsAmount} credits`);
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const { paymentId } = paymentIntent.metadata;

    if (!paymentId) {
      console.error('[STRIPE] Missing paymentId in failed payment intent:', paymentIntent.id);
      return;
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'FAILED',
      },
    });

    console.log(`[STRIPE] Payment failed: ${paymentIntent.id}`);
  }

  /**
   * Get payment history for user
   */
  async getUserPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: {
        userId,
        type: 'CREDIT_PURCHASE',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string, userId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId,
      },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    return payment;
  }

  /**
   * Refund a payment (ADMIN only)
   */
  async refundPayment(paymentId: string, reason?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment || !payment.stripePaymentIntentId) {
      throw new BadRequestException('Payment not found or not refundable');
    }

    if (payment.status !== 'SUCCEEDED') {
      throw new BadRequestException('Can only refund succeeded payments');
    }

    // Create Stripe refund
    const refund = await this.stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      reason: 'requested_by_customer',
    });

    // Update payment status
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REFUNDED',
      },
    });

    // Deduct credits from user
    const credits = (payment.metadata as any).credits;
    if (credits) {
      await this.creditsService.deductCredits(
        payment.userId,
        credits,
        'REFUND',
        {
          paymentId,
          description: `Remboursement de ${credits} crédits`,
        },
      );
    }

    // Notify user
    await this.prisma.notification.create({
      data: {
        userId: payment.userId,
        type: 'SYSTEM',
        title: 'Remboursement effectué',
        message: `Votre achat de ${credits} crédits a été remboursé. Raison: ${reason || 'Non spécifiée'}`,
      },
    });

    return { success: true, refund };
  }
}
