import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ example: 'prod_123' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional()
  @IsOptional()
  customizations?: any;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ example: 'usr_123' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ example: 'branch_abc' })
  @IsString()
  @IsNotEmpty()
  branchId!: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @ApiPropertyOptional({ example: 'DINE_IN' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 'PREPARING' })
  @IsString()
  @IsNotEmpty()
  status!: string;
}

export class SubmitFeedbackDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  productRating!: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  serviceRating!: number;

  @ApiProperty({ example: 4 })
  @IsNumber()
  @Min(1)
  atmosphereRating!: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  comment?: string;
}
