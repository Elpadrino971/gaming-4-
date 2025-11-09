import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VipService {
  private stripe: Stripe;
  private readonly VIP_PRICE_ID = 'price_vip_monthly'; // To be created in Stripe
  private readonly VIP_PRICE = 9.99;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-11-20.acacia',
    });
  }

  /**
   * Create VIP subscription
   */
  async createSubscription(userId: string, paymentMethodId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isVip) {
      throw new BadRequestException('User is already VIP');
    }

    // Create or retrieve Stripe customer
    let customerId = null;
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (existingSubscription?.stripeCustomerId) {
      customerId = existingSubscription.stripeCustomerId;
    } else {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
          username: user.username,
        },
      });
      customerId = customer.id;
    }

    // Attach payment method
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    await this.stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'VIP Membership',
              description:
                '+20% sur tous les gains, accès prioritaire, badge VIP',
            },
            unit_amount: Math.round(this.VIP_PRICE * 100), // 9.99€
            recurring: {
              interval: 'month',
            },
          },
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Save subscription in database
    const now = new Date();
    const periodEnd = new Date(subscription.current_period_end * 1000);

    await this.prisma.subscription.create({
      data: {
        userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        status: 'PENDING',
        planName: 'VIP',
        pricePerMonth: this.VIP_PRICE,
        startDate: now,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    // Activate VIP status
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isVip: true,
        vipSince: now,
        vipExpiresAt: periodEnd,
      },
    });

    return {
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any).payment_intent
        .client_secret,
    };
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new BadRequestException('No active subscription found');
    }

    // Cancel at end of billing period
    await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        cancelAt: subscription.currentPeriodEnd,
        canceledAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Subscription will cancel at end of billing period',
      endsAt: subscription.currentPeriodEnd,
    };
  }

  /**
   * Handle Stripe webhook for subscription events
   */
  async handleSubscriptionWebhook(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;

    const dbSubscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!dbSubscription) {
      console.error('Subscription not found:', subscription.id);
      return;
    }

    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
        await this.prisma.subscription.update({
          where: { id: dbSubscription.id },
          data: {
            status: subscription.status === 'active' ? 'ACTIVE' : 'PENDING',
            currentPeriodStart: new Date(
              subscription.current_period_start * 1000,
            ),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        await this.prisma.user.update({
          where: { id: dbSubscription.userId },
          data: {
            isVip: subscription.status === 'active',
            vipExpiresAt: new Date(subscription.current_period_end * 1000),
          },
        });
        break;

      case 'customer.subscription.deleted':
        await this.prisma.subscription.update({
          where: { id: dbSubscription.id },
          data: {
            status: 'EXPIRED',
          },
        });

        await this.prisma.user.update({
          where: { id: dbSubscription.userId },
          data: {
            isVip: false,
            vipExpiresAt: new Date(),
          },
        });
        break;
    }
  }

  /**
   * Get user subscription status
   */
  async getSubscriptionStatus(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        isVip: true,
        vipSince: true,
        vipExpiresAt: true,
      },
    });

    return {
      isVip: user?.isVip || false,
      vipSince: user?.vipSince,
      expiresAt: user?.vipExpiresAt,
      subscription: subscription || null,
    };
  }

  /**
   * Get VIP benefits description
   */
  getVipBenefits() {
    return {
      price: this.VIP_PRICE,
      currency: 'EUR',
      interval: 'month',
      benefits: [
        {
          icon: '💰',
          title: '+20% sur tous les gains',
          description: 'Gagne 20% de crédits supplémentaires sur chaque victoire',
        },
        {
          icon: '🎫',
          title: 'Entrée gratuite quotidienne',
          description: '1 partie Express gratuite par jour',
        },
        {
          icon: '⚡',
          title: 'Accès prioritaire',
          description: 'Rejoins les parties avant les autres joueurs',
        },
        {
          icon: '👑',
          title: 'Badge VIP',
          description: 'Badge doré visible par tous les joueurs',
        },
        {
          icon: '🎁',
          title: 'Réduction boutique -10%',
          description: '10% de réduction sur tous les produits',
        },
        {
          icon: '🎰',
          title: 'Roue bonus améliorée',
          description: 'Meilleurs lots sur la roue quotidienne',
        },
      ],
    };
  }
}
