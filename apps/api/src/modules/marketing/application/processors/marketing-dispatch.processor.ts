import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import {
  MARKETING_DISPATCH_JOB,
  MARKETING_DISPATCH_QUEUE,
  type MarketingDispatchJobData,
} from '../../marketing.constants';
import { MarketingService } from '../services/marketing.service';

@Processor(MARKETING_DISPATCH_QUEUE, { concurrency: 2 })
export class MarketingDispatchProcessor extends WorkerHost {
  constructor(private readonly marketingService: MarketingService) {
    super();
  }

  async process(job: Job<MarketingDispatchJobData>): Promise<void> {
    if (job.name !== MARKETING_DISPATCH_JOB) {
      throw new Error(`Unsupported marketing job: ${job.name}`);
    }
    await this.marketingService.processCampaign(job.data.campaignId);
  }
}
