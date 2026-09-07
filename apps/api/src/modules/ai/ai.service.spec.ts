import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { CatalogService } from '../catalog/application/services/catalog.service';
import { TasteProfile } from './dto/recommendation.dto';

describe('AiService', () => {
  let service: AiService;
  const catalogService = { getFullCatalog: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: CatalogService, useValue: catalogService },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    catalogService.getFullCatalog.mockResolvedValue({
      categories: [],
      products: [
        {
          id: 'americano-id',
          name: 'Americano',
          description: 'Bold espresso with hot water',
          price: 22000,
          image: null,
          tags: ['bold', 'dark'],
          isPopular: true,
          rating: 4.8,
          category: { name: 'Espresso', slug: 'espresso' },
        },
        {
          id: 'caramel-id',
          name: 'Caramel Latte',
          description: 'Sweet caramel and steamed milk',
          price: 32000,
          image: null,
          tags: ['sweet', 'creamy'],
          isPopular: true,
          rating: 4.7,
          category: { name: 'Espresso', slug: 'espresso' },
        },
        {
          id: 'cold-brew-id',
          name: 'Classic Cold Brew',
          description: 'Bright and refreshing cold coffee',
          price: 35000,
          image: null,
          tags: ['fruity', 'bright'],
          isPopular: true,
          rating: 4.6,
          category: { name: 'Cold Brew', slug: 'cold-brew' },
        },
        {
          id: 'croissant-id',
          name: 'Croissant Mentega',
          description: 'Flaky pastry',
          price: 25000,
          image: null,
          tags: [],
          isPopular: false,
          rating: 4.5,
          category: { name: 'Snacks', slug: 'snacks' },
        },
      ],
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getFlavorProfiles: should return list of flavor profiles', async () => {
    const profiles = service.getFlavorProfiles();
    expect(profiles.length).toBeGreaterThan(0);
    expect(profiles.some((p) => p.id === TasteProfile.SWEET_CREAMY)).toBe(true);
    expect(profiles.some((p) => p.id === TasteProfile.FRUITY_ACIDIC)).toBe(
      true,
    );
  });

  it('recommend: should return recommendations for sweet_creamy profile', async () => {
    const res = await service.recommend({
      tasteProfile: TasteProfile.SWEET_CREAMY,
    });
    expect(res.highlightedProducts.length).toBeGreaterThan(0);
    expect(res.pairingSnack).toBeDefined();
    expect(res.flavorTags.length).toBeGreaterThan(0);
  });

  it('recommend: should infer fruity profile from query', async () => {
    const res = await service.recommend({
      userQuery: 'mau kopi yang asem seger strawberry',
    });
    expect(
      res.highlightedProducts.some((p) => p.name.includes('Cold Brew')),
    ).toBe(true);
    expect(res.message).toContain('Classic Cold Brew');
  });

  it('chatWithBarista: should answer sleepiness query with high caffeine bold drinks', async () => {
    const chat = await service.chatWithBarista(
      'lagi ngantuk banget butuh begadang kerja tugas',
    );
    expect(chat.reply).toContain('Americano');
    expect(chat.suggestedAction).toBe('ORDER_BOLD_CHOCOLATEY');
    expect(chat.recommendedProductId).toBe('americano-id');
  });

  it('chatWithBarista: should answer non-coffee inquiry with matcha / mocktail', async () => {
    const chat = await service.chatWithBarista(
      'ada minuman non kopi yang enak?',
    );
    expect(chat.reply).toBeTruthy();
    expect(chat.suggestedAction).toBe('ORDER_REFRESHING');
  });
});
