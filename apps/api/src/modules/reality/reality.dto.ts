import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export const GALLERY_PROVENANCE = [
  'VERIFIED_VENUE_PHOTO',
  'VERIFIED_BRANCH_PHOTO',
  'BRAND_ASSET',
  'PLACEHOLDER',
  'UNVERIFIED',
] as const;
export const CONTENT_SECTIONS = [
  'homepage.hero',
  'about.story',
  'menu.notice',
  'gallery.notice',
] as const;

export class GalleryDraftDto {
  @IsString() @MinLength(1) @MaxLength(160) title!: string;
  @IsOptional() @IsString() @MaxLength(1000) caption?: string;
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(2000)
  imageUrl!: string;
  @IsOptional() @IsIn(['jetis-kulon', 'prapen']) branchId?: string;
  @IsIn(GALLERY_PROVENANCE) provenance!: string;
  @IsBoolean() isVerified!: boolean;
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(2000)
  sourceUrl?: string;
  @IsOptional()
  @IsIn(['PRIMARY_OPERATOR', 'DIRECT_PHYSICAL_AUDIT'])
  sourceType?: 'PRIMARY_OPERATOR' | 'DIRECT_PHYSICAL_AUDIT';
  @IsOptional() @IsDateString() capturedAt?: string;
  @IsOptional() @IsDateString() lastVerifiedAt?: string;
  @IsOptional() @IsDateString() updatedAt?: string;
}

export class SiteDraftDto {
  @IsIn(CONTENT_SECTIONS) sectionKey!: string;
  @IsString() @MinLength(1) @MaxLength(160) title!: string;
  @IsOptional() @IsString() @MaxLength(500) subtitle?: string;
  @IsString() @MinLength(1) @MaxLength(5000) body!: string;
  @IsOptional() @IsString() @MaxLength(1000) sourceReference?: string;
  @IsOptional() @IsDateString() updatedAt?: string;
}
