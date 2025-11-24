import { IsString, IsOptional, IsBoolean, Length, Matches } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @Length(2, 100)
  fullName: string;

  @IsString()
  @Length(5, 200)
  addressLine1: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  addressLine2?: string;

  @IsString()
  @Length(2, 100)
  city: string;

  @IsString()
  @Matches(/^[0-9]{5}$/, { message: 'Postal code must be 5 digits for France' })
  postalCode: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  country?: string; // ISO code: FR, BE, CH, etc.

  @IsString()
  @Matches(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, {
    message: 'Invalid French phone number format'
  })
  phoneNumber: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  fullName?: string;

  @IsOptional()
  @IsString()
  @Length(5, 200)
  addressLine1?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  addressLine2?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  city?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{5}$/, { message: 'Postal code must be 5 digits for France' })
  postalCode?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  country?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
