import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module';
import { CreditsModule } from './credits/credits.module';
import { ShopModule } from './shop/shop.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { MissionsModule } from './missions/missions.module';
import { VipModule } from './vip/vip.module';
import { ReferralsModule } from './referrals/referrals.module';
import { WheelModule } from './wheel/wheel.module';
import { AchievementsModule } from './achievements/achievements.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { BattlePassModule } from './battle-pass/battle-pass.module';
import { CosmeticsModule } from './cosmetics/cosmetics.module';
import { ChatModule } from './chat/chat.module';
import { AddressesModule } from './addresses/addresses.module';
import { ProductsModule } from './products/products.module';
import { PrizesModule } from './prizes/prizes.module';
import { StripeModule } from './stripe/stripe.module';
import { ShippingModule } from './shipping/shipping.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting & Security
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute (general)
      },
    ]),

    // Database
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    GamesModule,
    CreditsModule,
    ShopModule,
    ProductsModule,
    PrizesModule,
    StripeModule,
    ShippingModule,
    PaymentsModule,
    AdminModule,
    MissionsModule,
    VipModule,
    AddressesModule,

    // New gamification features
    ReferralsModule,
    WheelModule,
    AchievementsModule,
    TournamentsModule,
    BattlePassModule,
    CosmeticsModule,
    ChatModule,
  ],
})
export class AppModule {}
