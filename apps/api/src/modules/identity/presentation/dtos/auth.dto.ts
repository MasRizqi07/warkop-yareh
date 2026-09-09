import {
  IsBoolean,
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  IsNotEmpty,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@warkopyareh.id' })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: '08123456789' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{8,15}$/, {
    message: 'phone must contain 8 to 15 digits',
  })
  phone?: string;

  @ApiProperty({ example: 'StrongPassword123!', minLength: 8 })
  @IsString()
  @MinLength(12, { message: 'Password must be at least 12 characters long' })
  @MaxLength(128)
  password!: string;

  @ApiPropertyOptional({
    default: false,
    description: 'Explicit opt-in for promotional WhatsApp messages',
  })
  @IsOptional()
  @IsBoolean()
  whatsAppMarketingOptIn?: boolean;
}

export class LoginDto {
  @ApiProperty({ example: 'user@warkopyareh.id' })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password!: string;
}

export class SendOtpDto {
  @ApiProperty({ example: 'user@warkopyareh.id' })
  @IsEmail()
  @MaxLength(254)
  email!: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'user@warkopyareh.id' })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'code must contain exactly 6 digits' })
  code!: string;
}
