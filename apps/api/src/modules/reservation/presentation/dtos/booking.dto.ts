import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class BookingQuoteDto {
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  packageId!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @ArrayUnique()
  @IsString({ each: true })
  addonIds?: string[];
}

export class BookingAvailabilityDto {
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  branchId!: string;

  @IsString()
  @MaxLength(128)
  packageId!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;
}

export class CreateBookingDto extends BookingQuoteDto {
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  branchId!: string;

  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  tableId!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @IsInt()
  @Min(1)
  @Max(50)
  guestCount!: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  specialRequests?: string;

  @IsInt()
  @Min(1)
  @Max(1_160_000_000)
  expectedTotal!: number;
}
