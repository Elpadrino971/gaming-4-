import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BetaService } from './beta.service';
import { CreateBetaCodesDto, ValidateBetaCodeDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('beta')
export class BetaController {
  constructor(private readonly betaService: BetaService) {}

  /**
   * Check if beta mode is enabled (public endpoint)
   */
  @Get('status')
  getBetaStatus() {
    return {
      betaModeEnabled: this.betaService.isBetaModeEnabled(),
    };
  }

  /**
   * Validate a beta code (public endpoint)
   */
  @Post('validate')
  async validateCode(@Body() dto: ValidateBetaCodeDto) {
    const isValid = await this.betaService.checkBetaCode(dto.code);
    return {
      valid: isValid,
      message: isValid ? 'Code is valid' : 'Invalid or expired code',
    };
  }

  /**
   * Generate beta codes (admin only)
   */
  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async generateCodes(@Request() req, @Body() dto: CreateBetaCodesDto) {
    const adminId = req.user.userId;
    return await this.betaService.generateBetaCodes(
      adminId,
      dto.count,
      dto.prefix,
      dto.expiresInDays,
      dto.notes,
    );
  }

  /**
   * Get all beta codes (admin only)
   */
  @Get('codes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllCodes(@Request() req) {
    const adminId = req.user.userId;
    return await this.betaService.getAllBetaCodes(adminId);
  }

  /**
   * Get beta statistics (admin only)
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getStats() {
    return await this.betaService.getBetaStats();
  }

  /**
   * Delete a beta code (admin only)
   */
  @Delete('codes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteCode(@Request() req, @Param('id') codeId: string) {
    const adminId = req.user.userId;
    return await this.betaService.deleteBetaCode(codeId, adminId);
  }
}
