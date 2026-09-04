import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiService } from './ai.service';
import {
  RecommendationRequestDto,
  BaristaChatDto,
} from './dto/recommendation.dto';

@ApiTags('ai')
@Controller('api/v1/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('flavor-profiles')
  async getFlavorProfiles() {
    return this.aiService.getFlavorProfiles();
  }

  @Post('recommend-pairings')
  @HttpCode(HttpStatus.OK)
  async recommendPairings(@Body() body: RecommendationRequestDto) {
    return this.aiService.recommend(body);
  }

  @Post('barista-chat')
  @HttpCode(HttpStatus.OK)
  async baristaChat(@Body() body: BaristaChatDto) {
    return this.aiService.chatWithBarista(body.message, body.context);
  }
}
