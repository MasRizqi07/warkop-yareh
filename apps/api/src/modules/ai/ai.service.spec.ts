import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getFlavorProfiles: should return list of flavor profiles', async () => {
    const profiles = await service.getFlavorProfiles();
    expect(profiles.length).toBeGreaterThan(0);
    expect(profiles.some((p) => p.id === 'sweet_creamy')).toBe(true);
    expect(profiles.some((p) => p.id === 'fruity_acidic')).toBe(true);
  });

  it('recommend: should return recommendations for sweet_creamy profile', async () => {
    const res = await service.recommend({ tasteProfile: 'sweet_creamy' });
    expect(res.highlightedProducts.length).toBeGreaterThan(0);
    expect(res.pairingSnack).toBeDefined();
    expect(res.flavorTags.length).toBeGreaterThan(0);
  });

  it('recommend: should infer fruity profile from query', async () => {
    const res = await service.recommend({
      userQuery: 'mau kopi yang asem seger strawberry',
    });
    expect(
      res.highlightedProducts.some(
        (p) => p.name.includes('Ijen') || p.name.includes('Toraja'),
      ),
    ).toBe(true);
    expect(res.message).toContain('asem seger');
  });

  it('chatWithBarista: should answer sleepiness query with high caffeine bold drinks', async () => {
    const chat = await service.chatWithBarista(
      'lagi ngantuk banget butuh begadang kerja tugas',
    );
    expect(chat.reply).toContain('Americano Robusta Dampit');
    expect(chat.suggestedAction).toBe('ORDER_BOLD');
    expect(chat.recommendedProductId).toBe('p6');
  });

  it('chatWithBarista: should answer non-coffee inquiry with matcha / mocktail', async () => {
    const chat = await service.chatWithBarista(
      'ada minuman non kopi yang enak?',
    );
    expect(chat.reply).toContain('Matcha Latte');
    expect(chat.suggestedAction).toBe('ORDER_NON_COFFEE');
  });
});
