import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private addressesService: AddressesService) {}

  /**
   * Get all addresses for the authenticated user
   */
  @Get()
  async getMyAddresses(@Request() req) {
    return this.addressesService.getUserAddresses(req.user.id);
  }

  /**
   * Get default address for the authenticated user
   */
  @Get('default')
  async getMyDefaultAddress(@Request() req) {
    return this.addressesService.getDefaultAddress(req.user.id);
  }

  /**
   * Get a specific address
   */
  @Get(':id')
  async getAddress(@Param('id') id: string, @Request() req) {
    return this.addressesService.getAddress(id, req.user.id);
  }

  /**
   * Create a new address
   */
  @Post()
  async createAddress(@Body() dto: CreateAddressDto, @Request() req) {
    return this.addressesService.createAddress(req.user.id, dto);
  }

  /**
   * Update an address
   */
  @Patch(':id')
  async updateAddress(
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
    @Request() req,
  ) {
    return this.addressesService.updateAddress(id, req.user.id, dto);
  }

  /**
   * Delete an address
   */
  @Delete(':id')
  async deleteAddress(@Param('id') id: string, @Request() req) {
    return this.addressesService.deleteAddress(id, req.user.id);
  }

  /**
   * Set an address as default
   */
  @Post(':id/set-default')
  async setDefaultAddress(@Param('id') id: string, @Request() req) {
    return this.addressesService.setDefaultAddress(id, req.user.id);
  }
}
