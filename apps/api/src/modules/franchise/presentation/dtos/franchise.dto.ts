import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgreementDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ownerName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ownerEmail!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  branchId!: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  royaltyPercentage?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  monthlyFee!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  agreementStart!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  agreementEnd?: string;
}

export class GenerateBillingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  agreementId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  period!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  dueDate!: string;
}
