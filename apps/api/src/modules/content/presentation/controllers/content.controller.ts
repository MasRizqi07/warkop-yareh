import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../common/decorators/public.decorator';
import { paginate } from '../../../../common/interfaces/paginated-response.interface';
import { ContentService } from '../../application/services/content.service';
import { ListPublishedContentDto, ListReviewsDto } from '../dtos/content.dto';

@ApiTags('public content')
@Public()
@Controller('api/v1/content')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get('blog')
  @ApiOperation({ summary: 'List published blog posts' })
  async listBlog(@Query() query: ListPublishedContentDto) {
    const result = await this.content.listBlogPosts(query);
    return paginate(result.data, result.total, query.page, query.limit);
  }

  @Get('blog/:slug')
  @ApiOperation({ summary: 'Get one published blog post by slug' })
  async blogPost(@Param('slug') slug: string) {
    return { data: await this.content.getBlogPost(slug) };
  }

  @Get('reviews')
  @ApiOperation({ summary: 'List verified public reviews' })
  async reviews(@Query() query: ListReviewsDto) {
    return {
      data: await this.content.listVerifiedReviews(query.branchId, query.limit),
    };
  }
}
