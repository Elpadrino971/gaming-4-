import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../types/prisma-enums';

@Controller('shipping')
export class ShippingController {
  constructor(private shippingService: ShippingService) {}

  /**
   * Get pending shipments (ADMIN)
   */
  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPendingShipments() {
    return this.shippingService.getPendingShipments();
  }

  /**
   * Get all shipments with optional status filter (ADMIN)
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getShipments(@Query('status') status?: string) {
    return this.shippingService.getShipments(status);
  }

  /**
   * Get shipping statistics (ADMIN)
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getShippingStats() {
    return this.shippingService.getShippingStats();
  }

  /**
   * Mark order as processing (ADMIN)
   */
  @Post(':orderId/processing')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async markAsProcessing(@Param('orderId') orderId: string) {
    return this.shippingService.markAsProcessing(orderId);
  }

  /**
   * Ship an order (ADMIN)
   */
  @Post(':orderId/ship')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async shipOrder(
    @Param('orderId') orderId: string,
    @Body('trackingNumber') trackingNumber?: string,
    @Body('carrier') carrier?: string,
  ) {
    // Generate tracking number if not provided
    const tracking = trackingNumber || this.shippingService.generateTrackingNumber();
    return this.shippingService.shipOrder(orderId, tracking, carrier);
  }

  /**
   * Mark order as delivered (ADMIN)
   */
  @Post(':orderId/delivered')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async markAsDelivered(@Param('orderId') orderId: string) {
    return this.shippingService.markAsDelivered(orderId);
  }

  /**
   * Batch ship orders (ADMIN)
   */
  @Post('batch-ship')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async batchShip(@Body('orderIds') orderIds: string[]) {
    return this.shippingService.batchShipOrders(orderIds);
  }

  /**
   * Get tracking info for user's order
   */
  @Get('tracking/:orderId')
  @UseGuards(JwtAuthGuard)
  async getTrackingInfo(@Param('orderId') orderId: string, @Request() req) {
    return this.shippingService.getTrackingInfo(orderId, req.user.id);
  }

  /**
   * Calculate shipping cost
   */
  @Get('calculate-cost')
  calculateShippingCost(
    @Query('country') country: string,
    @Query('weight') weight: string,
  ) {
    return {
      cost: this.shippingService.calculateShippingCost(country, parseFloat(weight)),
      currency: 'EUR',
    };
  }
}
