import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VipController } from './vip.controller';
import { VipService } from './vip.service';

@Module({
  imports: [ConfigModule],
  controllers: [VipController],
  providers: [VipService],
  exports: [VipService],
})
export class VipModule {}
