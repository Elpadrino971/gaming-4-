import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class ValidateBetaCodeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  code: string;
}
