import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MODERATOR')
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (paginated)' })
  async getUsers(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 20,
  ) {
    return this.adminService.getUsers(page, limit);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get all orders (paginated)' })
  async getOrders(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 20,
    @Query('status') status?: string,
  ) {
    return this.adminService.getOrders(page, limit, status);
  }

  @Put('orders/:id')
  @ApiOperation({ summary: 'Update order status' })
  async updateOrder(
    @Param('id') id: string,
    @Body() body: { status: string; trackingNumber?: string },
  ) {
    return this.adminService.updateOrderStatus(id, body.status, body.trackingNumber);
  }

  @Get('products')
  @ApiOperation({ summary: 'Get all products' })
  async getProducts() {
    return this.adminService.getProducts();
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'Update product' })
  async updateProduct(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateProduct(id, data);
  }

  @Get('games')
  @ApiOperation({ summary: 'Get all games (paginated)' })
  async getGames(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 20,
  ) {
    return this.adminService.getGames(page, limit);
  }
}
