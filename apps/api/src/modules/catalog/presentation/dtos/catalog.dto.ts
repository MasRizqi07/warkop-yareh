import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Kopi Susu Gula Aren' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @IsNotEmpty()
  price!: number;

  @ApiProperty({ example: 'cat_123' })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  price?: number;
}

export class ToggleAvailabilityDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isAvailable!: boolean;
}
