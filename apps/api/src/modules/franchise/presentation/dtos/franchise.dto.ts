import {
  IsDateString,
  IsEmail,
  IsInt,
  IsString,
  IsNumber,
  Matches,
  Max,
  MaxLength,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgreementDto {
  @ApiProperty()
  @IsString()
  @MaxLength(160)
  ownerName!: string;

  @ApiProperty()
  @IsEmail()
  @MaxLength(254)
  ownerEmail!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(128)
  branchId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyName?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  royaltyPercentage?: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1_000_000_000)
  monthlyFee!: number;

  @ApiProperty()
  @IsDateString({ strict: true })
  agreementStart!: string;

  @ApiPropertyOptional()
  @IsDateString({ strict: true })
  @IsOptional()
  agreementEnd?: string;
}

export class GenerateBillingDto {
  @ApiProperty()
  @IsString()
  @MaxLength(128)
  agreementId!: string;

  @ApiProperty()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'period must use YYYY-MM format',
  })
  period!: string;

  @ApiProperty()
  @IsDateString({ strict: true })
  dueDate!: string;
}
