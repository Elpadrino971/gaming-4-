import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all addresses for a user
   */
  async getUserAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' }, // Default address first
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Get default address for a user
   */
  async getDefaultAddress(userId: string) {
    const address = await this.prisma.address.findFirst({
      where: { userId, isDefault: true },
    });

    return address;
  }

  /**
   * Get a specific address
   */
  async getAddress(addressId: string, userId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  /**
   * Create a new address
   */
  async createAddress(userId: string, dto: CreateAddressDto) {
    // Validate French postal code if country is France
    if (dto.country === 'FR' && !this.isValidFrenchPostalCode(dto.postalCode)) {
      throw new BadRequestException('Invalid French postal code');
    }

    // If this is set as default, unset other default addresses
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // If user has no addresses, make this one default
    const existingCount = await this.prisma.address.count({
      where: { userId },
    });

    const address = await this.prisma.address.create({
      data: {
        userId,
        fullName: dto.fullName,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        postalCode: dto.postalCode,
        country: dto.country || 'FR',
        phoneNumber: dto.phoneNumber,
        isDefault: dto.isDefault !== undefined ? dto.isDefault : existingCount === 0,
      },
    });

    return address;
  }

  /**
   * Update an address
   */
  async updateAddress(addressId: string, userId: string, dto: UpdateAddressDto) {
    const address = await this.getAddress(addressId, userId);

    // Validate French postal code if updating
    if (dto.country === 'FR' && dto.postalCode && !this.isValidFrenchPostalCode(dto.postalCode)) {
      throw new BadRequestException('Invalid French postal code');
    }

    // If setting as default, unset other defaults
    if (dto.isDefault === true) {
      await this.prisma.address.updateMany({
        where: {
          userId,
          isDefault: true,
          id: { not: addressId }
        },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data: dto,
    });
  }

  /**
   * Delete an address
   */
  async deleteAddress(addressId: string, userId: string) {
    const address = await this.getAddress(addressId, userId);

    // If deleting default address, make another one default
    if (address.isDefault) {
      const otherAddress = await this.prisma.address.findFirst({
        where: {
          userId,
          id: { not: addressId }
        },
      });

      if (otherAddress) {
        await this.prisma.address.update({
          where: { id: otherAddress.id },
          data: { isDefault: true },
        });
      }
    }

    await this.prisma.address.delete({
      where: { id: addressId },
    });

    return { success: true };
  }

  /**
   * Set an address as default
   */
  async setDefaultAddress(addressId: string, userId: string) {
    const address = await this.getAddress(addressId, userId);

    // Unset all other default addresses
    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // Set this one as default
    return this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }

  /**
   * Validate French postal code (5 digits)
   */
  private isValidFrenchPostalCode(postalCode: string): boolean {
    return /^[0-9]{5}$/.test(postalCode);
  }

  /**
   * Validate phone number (French format)
   */
  private isValidFrenchPhone(phone: string): boolean {
    // French phone: 0X XX XX XX XX or +33 X XX XX XX XX
    return /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(phone);
  }
}
