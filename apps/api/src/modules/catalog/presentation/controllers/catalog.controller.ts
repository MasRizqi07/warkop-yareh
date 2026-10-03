import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
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
import { Role } from '@warkop-yareh/database';
import { CatalogService } from '../../application/services/catalog.service';
import { paginate } from '../../../../common/interfaces/paginated-response.interface';
import {
  CreateProductDto,
  UpdateProductDto,
  ToggleAvailabilityDto,
  ListProductsQueryDto,
  UpdateBranchProductDto,
  ProductPublicationDto,
  CreateCategoryDto,
  MenuEvidenceDto,
  ReplaceCustomizationsDto,
} from '../dtos/catalog.dto';
import { JwtAuthGuard } from '../../../../infrastructure/auth/jwt-auth.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Public } from '../../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';
import {
  assertBranchAccess,
  resolveManagedBranch,
} from '../../../../common/authorization/branch-access';

@ApiTags('catalog')
@Controller('api/v1')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

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
  @Roles(
    Role.STAFF,
    Role.CASHIER,
    Role.KITCHEN,
    Role.MANAGER,
    Role.ADMIN,
    Role.OWNER,
    Role.SUPERADMIN,
  )
  @ApiOperation({ summary: 'List all branch products directly' })
  async listBranchProducts(
    @CurrentUser() user: AuthenticatedUser,
    @Query('branchId') requestedBranchId?: string,
  ) {
    const branchId = resolveManagedBranch(user, requestedBranchId);
    const data = await this.catalogService.listBranchProducts(branchId);
    return { data };
  }

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'List all active categories' })
  async listCategories() {
    const categories = await this.catalogService.listCategories();
    return { data: categories };
  }

  @Get('admin/categories')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'List categories including those without published products',
  })
  async listAdminCategories() {
    return { data: await this.catalogService.listAdminCategories() };
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Create menu category for verified product workflow',
  })
  async createCategory(@Body() body: CreateCategoryDto) {
    return { data: await this.catalogService.createCategory(body.name) };
  }

  @Get('products')
  @Public()
  @ApiOperation({ summary: 'List products with pagination and filters' })
  async listProducts(@Query() query: ListProductsQueryDto) {
    const result = await this.catalogService.listProducts(query);
    return paginate(result.data, result.total, query.page, query.limit);
  }

  @Get('products/:id')
  @Public()
  @ApiOperation({ summary: 'Get product by ID' })
  async getProduct(@Param('id') id: string) {
    const product = await this.catalogService.getProduct(id);
    return { data: product };
  }

  @Get('admin/products')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary:
      'List draft, review, verified, published and archived products for menu administration',
  })
  async listAdminProducts() {
    return { data: await this.catalogService.listAdminProducts() };
  }

  @Post('admin/products/:id/evidence')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary:
      'Record operator or physical menu evidence for a product under review',
  })
  async createMenuEvidence(
    @Param('id') id: string,
    @Body() body: MenuEvidenceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      data: await this.catalogService.createMenuEvidence(id, user.id, body),
    };
  }

  @Patch('products/:id/publication')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Move product through the verified menu publication workflow',
  })
  async transitionProduct(
    @Param('id') id: string,
    @Body() body: ProductPublicationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      data: await this.catalogService.transitionProduct(
        id,
        body.status,
        user.id,
        body.sourceReferenceId,
      ),
    };
  }

  @Put('admin/products/:id/customizations')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Replace product customization groups and return product to draft',
  })
  async replaceCustomizations(
    @Param('id') id: string,
    @Body() body: ReplaceCustomizationsDto,
  ) {
    return {
      data: await this.catalogService.replaceCustomizations(id, body.groups),
    };
  }

  @Post('products')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create new product' })
  async createProduct(@Body() body: CreateProductDto) {
    const product = await this.catalogService.createProduct(body);
    return { data: product };
  }

  @Patch('products/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update product details' })
  async updateProduct(@Param('id') id: string, @Body() body: UpdateProductDto) {
    const product = await this.catalogService.updateProduct(id, body);
    return { data: product };
  }

  @Patch('branches/:branchId/products/:productId/availability')
  @UseGuards(JwtAuthGuard)
  @Roles(
    Role.STAFF,
    Role.CASHIER,
    Role.KITCHEN,
    Role.MANAGER,
    Role.ADMIN,
    Role.OWNER,
    Role.SUPERADMIN,
  )
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Toggle product availability at a branch' })
  async toggleAvailability(
    @Param('branchId') branchId: string,
    @Param('productId') productId: string,
    @Body() body: ToggleAvailabilityDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertBranchAccess(user, branchId);
    const result = await this.catalogService.toggleAvailability(
      branchId,
      productId,
      body.isAvailable,
    );
    return { data: result };
  }

  @Patch('branches/:branchId/products/:productId')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.MANAGER, Role.ADMIN, Role.OWNER, Role.SUPERADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Update branch pricing, availability, or inventory telemetry',
  })
  async updateBranchProduct(
    @Param('branchId') branchId: string,
    @Param('productId') productId: string,
    @Body() body: UpdateBranchProductDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    assertBranchAccess(user, branchId);
    const result = await this.catalogService.updateBranchProduct(
      branchId,
      productId,
      body,
    );
    return { data: result };
  }
}
