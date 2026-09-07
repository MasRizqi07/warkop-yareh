import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export const CAMPAIGN_OBJECTIVES = [
  'birthday',
  'night',
  'single_origin',
  'rsvp',
  'retention',
] as const;
export const CAMPAIGN_AUDIENCES = [
  'night_owls',
  'all_active',
  'at_risk',
  'coworking',
  'single_customer',
] as const;

export class CreateMarketingCampaignDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  name!: string;

  @ApiProperty({ enum: CAMPAIGN_OBJECTIVES })
  @IsIn(CAMPAIGN_OBJECTIVES)
  objective!: string;

  @ApiProperty({ enum: CAMPAIGN_AUDIENCES })
  @IsIn(CAMPAIGN_AUDIENCES)
  audience!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  targetUserId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  branchId?: string;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  discountPercent!: number;

  @ApiProperty({ minimum: 1, maximum: 720 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(720)
  expiresInHours!: number;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  @MaxLength(1_000)
  message!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  includeHeaderMedia?: boolean;
}

export class UpdateMarketingCampaignDto extends PartialType(
  CreateMarketingCampaignDto,
) {}

export class ListMarketingCampaignsDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  branchId?: string;
}

export class TestMarketingCampaignDto {
  @ApiProperty({ example: '+628123456789' })
  @IsString()
  @Matches(/^\+?[0-9][0-9\s-]{7,19}$/)
  phone!: string;
}
