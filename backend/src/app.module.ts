import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module';
import { CreditsModule } from './credits/credits.module';
import { AddressesModule } from './addresses/addresses.module';

// DISABLED FOR MVP - These modules use old schema fields that were removed
// import { AdminModule } from './admin/admin.module';
// import { ShopModule } from './shop/shop.module';
// import { PaymentsModule } from './payments/payments.module';
// import { ProductsModule } from './products/products.module';
// import { PrizesModule } from './prizes/prizes.module';
// import { StripeModule } from './stripe/stripe.module';
// import { ShippingModule } from './shipping/shipping.module';
// import { EmailModule } from './email/email.module';
// import { BetaModule } from './beta/beta.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Scheduler for auto-creating FLASH games
    ScheduleModule.forRoot(),

    // Rate limiting & Security
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute (general)
      },
    ]),

    // Database
    PrismaModule,

    // Core MVP modules (compatible with simplified schema)
    AuthModule,
    UsersModule,
    GamesModule,
    CreditsModule,
    AddressesModule,
  ],
})
export class AppModule {}
