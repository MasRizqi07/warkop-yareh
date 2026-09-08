import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CashMovementType } from '@warkop-yareh/database';

export class OpenShiftDto {
  @ApiProperty()
  @IsString()
  @MaxLength(128)
  branchId!: string;

  @ApiProperty({ minimum: 0, maximum: 1_000_000_000 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1_000_000_000)
  openingFloat!: number;
}

export class CreateCashMovementDto {
  @ApiProperty({ enum: CashMovementType })
  @IsEnum(CashMovementType)
  type!: CashMovementType;

  @ApiProperty({ minimum: 1, maximum: 1_000_000_000 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_000_000_000)
  amount!: number;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  reason!: string;
}

export class CloseShiftDto {
  @ApiProperty({ minimum: 0, maximum: 2_000_000_000 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(2_000_000_000)
  closingCash!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class ListShiftsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  branchId?: string;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
