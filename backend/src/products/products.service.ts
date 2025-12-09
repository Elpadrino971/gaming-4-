import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all products (with filters for admin)
   */
  async getAllProducts(includeInactive = false) {
    const where: any = {};

    if (!includeInactive) {
      where.status = 'ACTIVE';
    }

    return this.prisma.product.findMany({
      where,
      orderBy: [
        { status: 'asc' }, // ACTIVE first
        { priceInCredits: 'asc' }, // Then by price
      ],
    });
  }

  /**
   * Get products by price range (for automatic attribution)
   */
  async getProductsByPriceRange(minPrice: number, maxPrice: number) {
    return this.prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        priceInCredits: {
          gte: minPrice,
          lte: maxPrice,
        },
        OR: [
          { unlimited: true },
          { stock: { gt: 0 } },
        ],
      },
      orderBy: {
        priceInCredits: 'asc',
      },
    });
  }

  /**
   * Get a single product
   */
  async getProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  /**
   * Create a new product (ADMIN)
   */
  async createProduct(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
        images: dto.images || [],
        priceInCredits: dto.priceInCredits,
        priceInEur: dto.priceInEur ? dto.priceInEur : null,
        stock: dto.stock || 0,
        unlimited: dto.unlimited || false,
        status: dto.status || 'ACTIVE',
        amazonASIN: dto.amazonASIN,
        amazonUrl: dto.amazonUrl,
        category: dto.category,
        tags: dto.tags || [],
      },
    });
  }

  /**
   * Update a product (ADMIN)
   */
  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.getProduct(id);

    const updateData: any = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;
    if (dto.images !== undefined) updateData.images = dto.images;
    if (dto.priceInCredits !== undefined) {
      updateData.priceInCredits = dto.priceInCredits;
    }
    if (dto.priceInEur !== undefined) {
      updateData.priceInEur = dto.priceInEur ? dto.priceInEur : null;
    }
    if (dto.stock !== undefined) updateData.stock = dto.stock;
    if (dto.unlimited !== undefined) updateData.unlimited = dto.unlimited;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.amazonASIN !== undefined) updateData.amazonASIN = dto.amazonASIN;
    if (dto.amazonUrl !== undefined) updateData.amazonUrl = dto.amazonUrl;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.tags !== undefined) updateData.tags = dto.tags;

    return this.prisma.product.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete a product (ADMIN)
   */
  async deleteProduct(id: string) {
    const product = await this.getProduct(id);

    // Check if product is in any pending orders
    const ordersCount = await this.prisma.orderItem.count({
      where: {
        productId: id,
        order: {
          status: {
            in: ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED'],
          },
        },
      },
    });

    if (ordersCount > 0) {
      throw new BadRequestException(
        'Cannot delete product with pending orders. Set status to INACTIVE instead.',
      );
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Update stock quantity (ADMIN or automatic after sale)
   */
  async updateStock(id: string, quantity: number, operation: 'add' | 'subtract' | 'set') {
    const product = await this.getProduct(id);

    if (product.unlimited) {
      throw new BadRequestException('Cannot update stock for unlimited products');
    }

    let newStock: number;

    switch (operation) {
      case 'add':
        newStock = product.stock + quantity;
        break;
      case 'subtract':
        newStock = product.stock - quantity;
        if (newStock < 0) {
          throw new BadRequestException('Insufficient stock');
        }
        break;
      case 'set':
        newStock = quantity;
        break;
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        stock: newStock,
        status: newStock === 0 ? 'OUT_OF_STOCK' : product.status,
      },
    });

    return updated;
  }

  /**
   * Get product statistics (ADMIN dashboard)
   */
  async getProductStats() {
    const [total, active, outOfStock, totalValue, topSellers] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { status: 'ACTIVE' } }),
      this.prisma.product.count({ where: { status: 'OUT_OF_STOCK' } }),
      this.prisma.product.aggregate({
        _sum: { totalSold: true },
      }),
      this.prisma.product.findMany({
        orderBy: { totalSold: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          totalSold: true,
          priceInCredits: true,
          stock: true,
        },
      }),
    ]);

    return {
      total,
      active,
      outOfStock,
      totalSold: totalValue._sum.totalSold || 0,
      topSellers,
    };
  }

  /**
   * Find best matching product for a prize pool amount
   */
  async findProductForPrizePool(prizePoolInCredits: number) {
    // Convert prize pool to EUR equivalent (assuming 100 credits = 1 EUR)
    const prizeInEur = prizePoolInCredits / 100;

    // Define price range (±20%)
    const minPrice = prizeInEur * 0.8;
    const maxPrice = prizeInEur * 1.2;

    // Get products in range
    const products = await this.getProductsByPriceRange(
      minPrice * 100, // Convert back to credits
      maxPrice * 100,
    );

    if (products.length === 0) {
      // If no exact match, get closest product below prize value
      const closestProduct = await this.prisma.product.findFirst({
        where: {
          status: 'ACTIVE',
          priceInCredits: { lte: prizePoolInCredits },
          OR: [
            { unlimited: true },
            { stock: { gt: 0 } },
          ],
        },
        orderBy: {
          priceInCredits: 'desc', // Get the most expensive one below prize
        },
      });

      return closestProduct;
    }

    // Return the product closest to prize value
    return products.reduce((prev, curr) => {
      const prevDiff = Math.abs(Number(prev.priceInCredits) - prizePoolInCredits);
      const currDiff = Math.abs(Number(curr.priceInCredits) - prizePoolInCredits);
      return currDiff < prevDiff ? curr : prev;
    });
  }

  /**
   * Mark product as sold (update statistics)
   */
  async markAsSold(productId: string, quantity = 1) {
    const product = await this.getProduct(productId);

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        totalSold: { increment: quantity },
      },
    });

    // Decrement stock if not unlimited
    if (!product.unlimited) {
      await this.updateStock(productId, quantity, 'subtract');
    }

    return { success: true };
  }
}
