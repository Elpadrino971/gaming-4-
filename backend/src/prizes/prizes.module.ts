import { Module } from '@nestjs/common';
import { PrizesService } from './prizes.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
import { AddressesModule } from '../addresses/addresses.module';

@Module({
  imports: [PrismaModule, ProductsModule, AddressesModule],
  providers: [PrizesService],
  exports: [PrizesService],
})
export class PrizesModule {}
