import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@warkop-yareh/database';

export class CreateSnapPaymentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(128)
  orderId!: string;

  @ApiPropertyOptional({
    description: 'Optional assertion; the database total remains authoritative.',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2_147_483_647)
  grossAmount?: number;

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.E_WALLET })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod = PaymentMethod.E_WALLET;
}
