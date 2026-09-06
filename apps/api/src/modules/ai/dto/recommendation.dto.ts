import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TasteProfile {
  SWEET_CREAMY = 'sweet_creamy',
  FRUITY_ACIDIC = 'fruity_acidic',
  BOLD_CHOCOLATEY = 'bold_chocolatey',
  SPICED_HERBAL = 'spiced_herbal',
  REFRESHING = 'refreshing',
}

export class RecommendationRequestDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  preferences?: string[];

  @ApiPropertyOptional({ enum: TasteProfile })
  @IsOptional()
  @IsEnum(TasteProfile)
  tasteProfile?: TasteProfile;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(128, { each: true })
  currentCartItems?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  userQuery?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  branchId?: string;
}

export class BaristaChatDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  message!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  context?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  branchId?: string;
}
