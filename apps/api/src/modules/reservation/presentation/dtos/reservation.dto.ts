import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReservationStatus } from '@warkop-yareh/database';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateReservationDto {
  @ApiProperty()
  @IsString()
  @MaxLength(128)
  branchId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  tableId?: string;

  @ApiProperty({ example: '2026-09-10' })
  @IsDateString({ strict: true })
  date!: string;

  @ApiProperty({ example: '14:00' })
  @IsString()
  @Matches(TIME_PATTERN, { message: 'startTime must use HH:mm format' })
  startTime!: string;

  @ApiProperty({ example: '16:00' })
  @IsString()
  @Matches(TIME_PATTERN, { message: 'endTime must use HH:mm format' })
  endTime!: string;

  @ApiProperty({ minimum: 1, maximum: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  guestCount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  specialRequests?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  userId?: string;
}

export class UpdateReservationStatusDto {
  @ApiProperty({ enum: ReservationStatus })
  @IsEnum(ReservationStatus)
  status!: ReservationStatus;
}

export class ListReservationsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  userId?: string;

  @ApiPropertyOptional({ example: '2026-09-10' })
  @IsOptional()
  @IsDateString({ strict: true })
  date?: string;

  @ApiPropertyOptional({ enum: ReservationStatus })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
