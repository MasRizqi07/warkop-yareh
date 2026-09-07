import type { Job } from 'bullmq';
import { MarketingDispatchProcessor } from './marketing-dispatch.processor';
import { MarketingService } from '../services/marketing.service';

describe('MarketingDispatchProcessor', () => {
  const marketingService = {
    processCampaign: jest.fn(),
  };
  const processor = new MarketingDispatchProcessor(
    marketingService as unknown as MarketingService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('dispatches the campaign identified by the durable queue job', async () => {
    marketingService.processCampaign.mockResolvedValue(undefined);

    await processor.process({
      name: 'dispatch-campaign',
      data: { campaignId: 'campaign-1' },
    } as Job<{ campaignId: string }>);

    expect(marketingService.processCampaign).toHaveBeenCalledWith('campaign-1');
  });

  it('rejects unknown jobs instead of silently acknowledging them', async () => {
    await expect(
      processor.process({
        name: 'unknown-job',
        data: { campaignId: 'campaign-1' },
      } as Job<{ campaignId: string }>),
    ).rejects.toThrow('Unsupported marketing job');
    expect(marketingService.processCampaign).not.toHaveBeenCalled();
  });
});
