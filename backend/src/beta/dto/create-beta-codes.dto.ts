import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateBetaCodesDto {
  @IsInt()
  @Min(1)
  @Max(100)
  count: number = 10;

  @IsString()
  @IsOptional()
  prefix?: string = 'BINGO';

  @IsInt()
  @IsOptional()
  @Min(1)
  expiresInDays?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
