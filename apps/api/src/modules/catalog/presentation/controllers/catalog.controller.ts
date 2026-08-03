import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CatalogService } from '../../application/services/catalog.service';
import { paginate } from '../../../../common/interfaces/paginated-response.interface';
import {
  CreateProductDto,
  UpdateProductDto,
  ToggleAvailabilityDto,
} from '../dtos/catalog.dto';
import { JwtAuthGuard } from '../../../../infrastructure/auth/jwt-auth.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Public } from '../../../../common/decorators/public.decorator';

import { DatabaseService } from '../../../../infrastructure/database/database.service';

@ApiTags('catalog')
@Controller('api/v1')
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly prisma: DatabaseService,
  ) {}

  @Get('catalog')
  @Public()
  @ApiOperation({
    summary: 'Get full catalog with categories and products (cached)',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    description: 'Filter by branch availability',
  })
  async getFullCatalog(@Query('branchId') branchId?: string) {
    const catalog = await this.catalogService.getFullCatalog(branchId);
    return { data: catalog };
  }

  @Get('catalog/branch_products')
  @ApiOperation({ summary: 'List all branch products directly' })
  async listBranchProducts(@Query('branchId') branchId?: string) {
    const data = await this.prisma.branchProduct.findMany({
      where: branchId ? { branchId } : undefined,
    });
    return { data };
  }

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'List all active categories' })
  async listCategories() {
    const categories = await this.catalogService.listCategories();
    return { data: categories };
  }

  @Get('products')
  @Public()
  @ApiOperation({ summary: 'List products with pagination and filters' })
  async listProducts(
    @Query('categoryId') categoryId?: string,
    @Query('branchId') branchId?: string,
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const result = await this.catalogService.listProducts({
      categoryId,
      branchId,
      search,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    return paginate(result.data, result.total, parseInt(page), parseInt(limit));
  }

  @Get('products/:id')
  @Public()
  @ApiOperation({ summary: 'Get product by ID' })
  async getProduct(@Param('id') id: string) {
    const product = await this.catalogService.getProduct(id);
    return { data: product };
  }

  @Post('products')
  @UseGuards(JwtAuthGuard)
  @Roles('MANAGER', 'ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create new product' })
  async createProduct(@Body() body: CreateProductDto) {
    const product = await this.catalogService.createProduct(body);
    return { data: product };
  }

  @Patch('products/:id')
  @UseGuards(JwtAuthGuard)
  @Roles('MANAGER', 'ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update product details' })
  async updateProduct(@Param('id') id: string, @Body() body: UpdateProductDto) {
    const product = await this.catalogService.updateProduct(id, body);
    return { data: product };
  }

  @Patch('branches/:branchId/products/:productId/availability')
  @UseGuards(JwtAuthGuard)
  @Roles('STAFF', 'MANAGER', 'ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Toggle product availability at a branch' })
  async toggleAvailability(
    @Param('branchId') branchId: string,
    @Param('productId') productId: string,
    @Body() body: ToggleAvailabilityDto,
  ) {
    const result = await this.catalogService.toggleAvailability(
      branchId,
      productId,
      body.isAvailable,
    );
    return { data: result };
  }
}
