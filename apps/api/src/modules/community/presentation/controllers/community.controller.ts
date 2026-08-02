import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CommunityService } from '../../application/services/community.service';
import { CreateGroupDto, CreatePostDto } from '../dtos/community.dto';
import { paginate } from '../../../../common/interfaces/paginated-response.interface';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

@ApiTags('community')
@Controller('api/v1/community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post('groups')
  @ApiOperation({ summary: 'Create a new community group' })
  async createGroup(@Body() body: CreateGroupDto) {
    const data = await this.communityService.createGroup(body);
    return { data };
  }

  @Get('groups')
  async listGroups(@Query('category') category?: string) {
    const data = await this.communityService.listGroups(category);
    return { data };
  }

  @Post('groups/:groupId/join')
  @HttpCode(HttpStatus.OK)
  async joinGroup(
    @Param('groupId') groupId: string,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.communityService.joinGroup(userId, groupId);
    return { data };
  }

  @Post('posts')
  @ApiOperation({ summary: 'Create a post in a group' })
  async createPost(@CurrentUser() user: any, @Body() body: CreatePostDto) {
    const isEmployee = [
      'STAFF',
      'CASHIER',
      'MANAGER',
      'ADMIN',
      'OWNER',
      'SUPERADMIN',
    ].includes(user.role);
    const resolvedAuthorId = isEmployee ? body.authorId : user.id;
    const data = await this.communityService.createPost({
      ...body,
      authorId: resolvedAuthorId,
    });
    return { data };
  }

  @Get('groups/:groupId/posts')
  async listPosts(
    @Param('groupId') groupId: string,
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
  ) {
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 10;
    const { data, total } = await this.communityService.listPosts(
      groupId,
      page,
      limit,
    );
    return paginate(data, total, page, limit);
  }
}
