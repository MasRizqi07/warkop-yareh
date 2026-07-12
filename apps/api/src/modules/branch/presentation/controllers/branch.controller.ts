import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BranchService } from '../../application/services/branch.service';
import { CreateBranchDto, UpdateBranchDto } from '../dtos/branch.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Public } from '../../../../common/decorators/public.decorator';

@Controller('api/v1/branches')
@ApiTags('Branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @Roles('ADMIN', 'OWNER', 'SUPERADMIN')
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
  @Roles('ADMIN', 'OWNER', 'SUPERADMIN')
  @ApiOperation({ summary: 'Update branch details' })
  async update(
    @Param('id') id: string,
    @Body()
    body: UpdateBranchDto,
  ) {
    const data = await this.branchService.updateBranch(id, body);
    return { data };
  }
}
