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
import { Role } from '@warkop-yareh/database';
import { CommunityService } from '../../application/services/community.service';
import {
  CreateGroupDto,
  CreatePostDto,
  ListGroupsQueryDto,
  ListPostsQueryDto,
} from '../dtos/community.dto';
import { paginate } from '../../../../common/interfaces/paginated-response.interface';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Public } from '../../../../common/decorators/public.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';

@ApiTags('community')
@Controller('api/v1/community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post('groups')
  @Roles(Role.MANAGER, Role.ADMIN, Role.OWNER, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create a new community group' })
  async createGroup(@Body() body: CreateGroupDto) {
    const data = await this.communityService.createGroup(body);
    return { data };
  }

  @Get('groups')
  @Public()
  async listGroups(@Query() query: ListGroupsQueryDto) {
    const data = await this.communityService.listGroups(query.category);
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
  async createPost(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreatePostDto,
  ) {
    const data = await this.communityService.createPost({
      ...body,
      authorId: user.id,
    });
    return { data };
  }

  @Get('groups/:groupId/posts')
  @Public()
  async listPosts(
    @Param('groupId') groupId: string,
    @Query() query: ListPostsQueryDto,
  ) {
    const { data, total } = await this.communityService.listPosts(
      groupId,
      query.page,
      query.limit,
    );
    return paginate(data, total, query.page, query.limit);
  }
}
