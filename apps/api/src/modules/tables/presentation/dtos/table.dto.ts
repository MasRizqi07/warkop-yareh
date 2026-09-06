import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TableStatus, WaiterCallType } from '@warkop-yareh/database';

export class UpdateTableStatusDto {
  @ApiProperty({ example: 'OCCUPIED', enum: TableStatus })
  @IsEnum(TableStatus)
  status!: TableStatus;
}

export class CreateWaiterCallDto {
  @ApiProperty({ example: WaiterCallType.CALL_WAITER, enum: WaiterCallType })
  @IsEnum(WaiterCallType)
  type!: WaiterCallType;
}
