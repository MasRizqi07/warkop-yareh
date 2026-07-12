import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TableService } from '../../application/services/table.service';
import { TableStatus } from '@warkop-yareh/database';
import { JwtAuthGuard } from '../../../../infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Public } from '../../../../common/decorators/public.decorator';
import { UpdateTableStatusDto, CreateWaiterCallDto } from '../dtos/table.dto';

@ApiTags('tables')
@Controller('api/v1/tables')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Get('qr/:code')
  @Public()
  @ApiOperation({
    summary: 'Resolve a QR code to a table metadata (Guest & Customer)',
  })
  async resolveQrCode(@Param('code') code: string) {
    const table = await this.tableService.resolveQrCode(code);
    return { data: table };
  }

  @Get('branch/:branchId')
  @Roles('STAFF', 'CASHIER', 'MANAGER', 'ADMIN', 'OWNER', 'SUPERADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get all tables for a branch (Staff/Admin)' })
  async getTablesByBranch(
    @Param('branchId') branchId: string,
    @CurrentUser() user: { id: string; role: string; branchId: string },
  ) {
    if (!['SUPERADMIN', 'ADMIN'].includes(user.role)) {
      if (user.branchId !== branchId) {
        throw new ForbiddenException('You can only access tables from your own branch');
      }
    }
    const tables = await this.tableService.getTablesByBranch(branchId);
    return { data: tables };
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STAFF', 'MANAGER')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update table status (Staff/Manager)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateTableStatusDto,
  ) {
    const table = await this.tableService.updateStatus(id, body.status);
    return { data: table };
  }

  @Post(':id/call')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Call waiter or request bill' })
  async callWaiter(@Param('id') id: string, @Body() body: CreateWaiterCallDto) {
    const call = await this.tableService.createWaiterCall(id, body.type);
    return { data: call, message: 'Waiter called successfully' };
  }
}
