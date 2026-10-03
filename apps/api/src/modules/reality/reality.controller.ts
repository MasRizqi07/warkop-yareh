import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Role } from '@warkop-yareh/database';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RealityService } from './reality.service';
import { GalleryDraftDto, SiteDraftDto } from './reality.dto';

@Controller('api/v1/reality')
@Roles(Role.ADMIN, Role.OWNER, Role.SUPERADMIN)
export class RealityController {
  constructor(private readonly reality: RealityService) {}

  @Get('gallery/public')
  @Public()
  async publicGallery() {
    return { data: await this.reality.listGallery(true) };
  }

  @Get('gallery')
  async gallery() {
    return { data: await this.reality.listGallery() };
  }

  @Post('gallery')
  async createGallery(@Body() dto: GalleryDraftDto) {
    return { data: await this.reality.saveGallery(dto) };
  }

  @Patch('gallery/:id')
  async editGallery(@Param('id') id: string, @Body() dto: GalleryDraftDto) {
    return { data: await this.reality.saveGallery(dto, id) };
  }

  @Get('site-content')
  async siteContent() {
    return { data: await this.reality.listSiteDrafts() };
  }

  @Post('site-content')
  async saveSiteContent(@Body() dto: SiteDraftDto) {
    return { data: await this.reality.saveSiteDraft(dto) };
  }
}
