import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BranchService } from '../../application/services/branch.service';
import { CreateBranchDto, UpdateBranchDto } from '../dtos/branch.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Public } from '../../../../common/decorators/public.decorator';
import { Role } from '@warkop-yareh/database';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';
import {
  assertBranchAccess,
  hasGlobalBranchAccess,
} from '../../../../common/authorization/branch-access';

@Controller('api/v1/branches')
@ApiTags('Branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create a new branch' })
  async create(
    @Body()
    body: CreateBranchDto,
  ) {
    const data = await this.branchService.createBranch(body);
    return { data };
  }

  @Get()
  @Public()
  async list() {
    const data = await this.branchService.listBranches();
    return { data };
  }

  @Get(':id')
  @Public()
  async get(@Param('id') id: string) {
    const data = await this.branchService.getBranch(id);
    return { data };
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.OWNER, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Update branch details' })
  async update(
    @Param('id') id: string,
    @Body()
    body: UpdateBranchDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertBranchAccess(user, id);
    const update = hasGlobalBranchAccess(user)
      ? body
      : this.withoutLifecycleState(body);
    const data = await this.branchService.updateBranch(id, update);
    return { data };
  }

  private withoutLifecycleState(body: UpdateBranchDto): UpdateBranchDto {
    const safeFields = { ...body };
    delete safeFields.isActive;
    return safeFields;
  }
}
