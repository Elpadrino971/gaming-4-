import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, UpdateStockDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  /**
   * Get all products (public for shop, with includeInactive for admin)
   */
  @Get()
  async getProducts(@Query('includeInactive') includeInactive?: string) {
    return this.productsService.getAllProducts(includeInactive === 'true');
  }

  /**
   * Get product statistics (ADMIN only)
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getStats() {
    return this.productsService.getProductStats();
  }

  /**
   * Get products by price range
   */
  @Get('price-range')
  async getProductsByPriceRange(
    @Query('min') min: string,
    @Query('max') max: string,
  ) {
    return this.productsService.getProductsByPriceRange(
      parseFloat(min),
      parseFloat(max),
    );
  }

  /**
   * Find best product for prize pool
   */
  @Get('match-prize/:prizePool')
  async findProductForPrize(@Param('prizePool') prizePool: string) {
    return this.productsService.findProductForPrizePool(parseFloat(prizePool));
  }

  /**
   * Get a single product
   */
  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return this.productsService.getProduct(id);
  }

  /**
   * Create a new product (ADMIN only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  /**
   * Update a product (ADMIN only)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.updateProduct(id, dto);
  }

  /**
   * Update product stock (ADMIN only)
   */
  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateStock(@Param('id') id: string, @Body() dto: UpdateStockDto) {
    return this.productsService.updateStock(id, dto.quantity, dto.operation);
  }

  /**
   * Delete a product (ADMIN only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }

  /**
   * Mark product as sold
   */
  @Post(':id/mark-sold')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async markAsSold(
    @Param('id') id: string,
    @Body('quantity') quantity?: number,
  ) {
    return this.productsService.markAsSold(id, quantity || 1);
  }
}
