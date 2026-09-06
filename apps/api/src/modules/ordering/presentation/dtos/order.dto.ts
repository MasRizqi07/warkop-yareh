import {
  ArrayMaxSize,
  ArrayMinSize,
  IsEnum,
  IsInt,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, OrderType } from '@warkop-yareh/database';

export class OrderItemDto {
  @ApiProperty({ example: 'prod_123' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  quantity!: number;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: { type: 'string' },
    example: { milkType: 'Oat Milk', sweetness: 'Less Sweet' },
  })
  @IsOptional()
  @IsObject()
  customizations?: Record<string, string>;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(300)
  notes?: string;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ example: 'usr_123' })
  @IsString()
  @IsOptional()
  @MaxLength(128)
  userId?: string;

  @ApiProperty({ example: 'branch_abc' })
  @IsString()
  @IsNotEmpty()
  branchId!: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @ApiPropertyOptional({ enum: OrderType, example: OrderType.DINE_IN })
  @IsEnum(OrderType)
  @IsOptional()
  type?: OrderType;

  @ApiPropertyOptional({ example: 'table_123' })
  @IsString()
  @IsOptional()
  @MaxLength(128)
  tableId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Deprecated body fallback. Prefer the Idempotency-Key header.',
  })
  @IsString()
  @IsOptional()
  @Length(8, 128)
  idempotencyKey?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PREPARING })
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}

export class SubmitFeedbackDto {
  @ApiProperty({ example: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  productRating!: number;

  @ApiProperty({ example: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  serviceRating!: number;

  @ApiProperty({ example: 4 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  atmosphereRating!: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comment?: string;
}

export class ListOrdersQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(128)
  userId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(128)
  branchId?: string;

  @ApiPropertyOptional({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

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
