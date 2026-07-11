import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TableStatus } from '@warkop-yareh/database';

export class UpdateTableStatusDto {
  @ApiProperty({ example: 'OCCUPIED', enum: TableStatus })
  @IsEnum(TableStatus)
  status!: TableStatus;
}

export class CreateWaiterCallDto {
  @ApiProperty({ example: 'CALL_WAITER' })
  @IsString()
  @IsNotEmpty()
  type!: 'CALL_WAITER' | 'REQUEST_BILL' | 'NEED_ASSISTANCE';
}
