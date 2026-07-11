import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { BranchService } from '../../application/services/branch.service';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Public } from '../../../../common/decorators/public.decorator';

@Controller('api/v1/branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @Roles('ADMIN', 'OWNER', 'SUPERADMIN')
  async create(
    @Body()
    body: {
      name: string;
      address: string;
      phone?: string;
      latitude?: number;
      longitude?: number;
      operatingHours?: string;
    },
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
  async update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      name: string;
      address: string;
      phone: string;
      latitude: number;
      longitude: number;
      operatingHours: string;
      isActive: boolean;
    }>,
  ) {
    const data = await this.branchService.updateBranch(id, body);
    return { data };
  }
}
