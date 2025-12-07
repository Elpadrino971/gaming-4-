import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto';

@ApiTags('shop')
@Controller('shop')
export class ShopController {
  constructor(private shopService: ShopService) {}

  @Get('products')
  @ApiOperation({ summary: 'Get all products' })
  async getProducts(@Query('category') category?: string) {
    return this.shopService.getProducts(category);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product by ID' })
  async getProductById(@Param('id') id: string) {
    return this.shopService.getProductById(id);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get product categories' })
  async getCategories() {
    return this.shopService.getCategories();
  }

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new order' })
  async createOrder(@Request() req, @Body() dto: CreateOrderDto) {
    return this.shopService.createOrder(req.user.userId, dto);
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user orders' })
  async getUserOrders(@Request() req) {
    return this.shopService.getUserOrders(req.user.userId);
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order by ID' })
  async getOrderById(@Request() req, @Param('id') id: string) {
    return this.shopService.getOrderById(req.user.userId, id);
  }
}
