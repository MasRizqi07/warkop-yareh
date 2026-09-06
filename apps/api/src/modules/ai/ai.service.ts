import { Injectable, NotFoundException } from '@nestjs/common';
import { CatalogService } from '../catalog/application/services/catalog.service';
import type { CatalogProduct } from '../catalog/domain/repositories/catalog.repository.interface';
import {
  TasteProfile,
  type RecommendationRequestDto,
} from './dto/recommendation.dto';

export interface FlavorProfile {
  id: TasteProfile;
  name: string;
  description: string;
  recommendedProducts: string[];
  suggestedPairings: string[];
}

export interface RecommendationResult {
  message: string;
  highlightedProducts: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    image: string | null;
    flavorNotes: string[];
    pairingReason: string;
  }>;
  pairingSnack?: {
    id: string;
    name: string;
    price: number;
    reason: string;
  };
  flavorTags: string[];
}

const PROFILE_KEYWORDS: Readonly<Record<TasteProfile, readonly string[]>> = {
  [TasteProfile.SWEET_CREAMY]: [
    'latte',
    'milk',
    'susu',
    'caramel',
    'creamy',
    'sweet',
  ],
  [TasteProfile.FRUITY_ACIDIC]: [
    'v60',
    'toraja',
    'cold brew',
    'fruity',
    'citrus',
    'bright',
    'asam',
    'asem',
    'seger',
  ],
  [TasteProfile.BOLD_CHOCOLATEY]: [
    'espresso',
    'americano',
    'long black',
    'bold',
    'dark',
    'chocolate',
    'ngantuk',
    'begadang',
    'kafein',
    'kuat',
    'pahit',
  ],
  [TasteProfile.SPICED_HERBAL]: [
    'tea',
    'teh',
    'spice',
    'herbal',
    'cinnamon',
    'matcha',
  ],
  [TasteProfile.REFRESHING]: [
    'non kopi',
    'bukan kopi',
    'cold',
    'sparkling',
    'lemon',
    'lychee',
    'orange',
    'strawberry',
  ],
};

@Injectable()
export class AiService {
  private readonly flavorMatrix: Readonly<Record<TasteProfile, FlavorProfile>> =
    {
      [TasteProfile.SWEET_CREAMY]: {
        id: TasteProfile.SWEET_CREAMY,
        name: 'Manis & Creamy',
        description: 'Minuman lembut dengan susu dan rasa manis yang nyaman.',
        recommendedProducts: ['Caramel Latte', 'Cappuccino', 'Matcha Latte'],
        suggestedPairings: ['Croissant Mentega', 'Banana Bread'],
      },
      [TasteProfile.FRUITY_ACIDIC]: {
        id: TasteProfile.FRUITY_ACIDIC,
        name: 'Fruity & Bright Acidity',
        description: 'Kopi beraroma buah dengan rasa ringan dan segar.',
        recommendedProducts: ['Toraja V60', 'Classic Cold Brew'],
        suggestedPairings: ['Croissant Mentega', 'Granola Bar'],
      },
      [TasteProfile.BOLD_CHOCOLATEY]: {
        id: TasteProfile.BOLD_CHOCOLATEY,
        name: 'Bold, Dark & Nutty',
        description: 'Kopi dengan body tebal dan karakter panggang yang kuat.',
        recommendedProducts: ['Espresso', 'Americano', 'Long Black'],
        suggestedPairings: ['Cheese Toast', 'Nasi Goreng Kampung'],
      },
      [TasteProfile.SPICED_HERBAL]: {
        id: TasteProfile.SPICED_HERBAL,
        name: 'Spiced & Herbal',
        description: 'Profil aromatik, earthy, dan hangat.',
        recommendedProducts: ['Matcha Latte'],
        suggestedPairings: ['Karipap (Curry Puff)'],
      },
      [TasteProfile.REFRESHING]: {
        id: TasteProfile.REFRESHING,
        name: 'Segar & Ringan',
        description: 'Minuman dingin yang ringan dan menyegarkan.',
        recommendedProducts: [
          'Lychee Sparkling',
          'Blue Lemonade',
          'Strawberry Milk',
        ],
        suggestedPairings: ['Granola Bar', 'Croissant Mentega'],
      },
    };

  constructor(private readonly catalogService: CatalogService) {}

  getFlavorProfiles(): FlavorProfile[] {
    return Object.values(this.flavorMatrix);
  }

  async recommend(
    dto: RecommendationRequestDto,
  ): Promise<RecommendationResult> {
    const profileKey =
      dto.tasteProfile ?? this.inferProfileFromQuery(dto.userQuery ?? '');
    const profile = this.flavorMatrix[profileKey];
    const catalog = await this.catalogService.getFullCatalog(dto.branchId);
    const excludedIds = new Set(dto.currentCartItems ?? []);
    const beverageProducts = catalog.products.filter(
      (product) => !this.isFoodCategory(product),
    );
    const ranked = beverageProducts
      .map((product) => ({
        product,
        score: this.scoreProduct(product, profile, dto),
      }))
      .filter(({ product }) => !excludedIds.has(product.id))
      .sort(
        (left, right) =>
          right.score - left.score ||
          Number(right.product.isPopular) - Number(left.product.isPopular) ||
          right.product.rating - left.product.rating,
      );
    const selected = ranked.slice(0, 3).map(({ product }) => product);
    if (selected.length === 0) {
      throw new NotFoundException(
        'No available menu products match this branch',
      );
    }

    const snack = catalog.products
      .filter((product) => this.isFoodCategory(product))
      .sort((left, right) => {
        const leftPreferred = profile.suggestedPairings.includes(left.name);
        const rightPreferred = profile.suggestedPairings.includes(right.name);
        return Number(rightPreferred) - Number(leftPreferred);
      })[0];
    const flavorTags = [
      ...new Set(selected.flatMap((product) => product.tags)),
    ];

    return {
      message: dto.userQuery
        ? `Berdasarkan preferensimu, rekomendasi utama kami adalah ${selected[0].name}.`
        : `Rekomendasi Barista untuk profil ${profile.name}:`,
      highlightedProducts: selected.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category.name,
        price: product.price,
        description: product.description,
        image: product.image,
        flavorNotes:
          product.tags.length > 0
            ? product.tags.slice(0, 5)
            : PROFILE_KEYWORDS[profile.id].slice(0, 3).map(this.titleCase),
        pairingReason: `Sesuai dengan profil ${profile.name.toLowerCase()} dan tersedia di cabang pilihanmu.`,
      })),
      ...(snack
        ? {
            pairingSnack: {
              id: snack.id,
              name: snack.name,
              price: snack.price,
              reason: `Pilihan pendamping yang seimbang untuk ${selected[0].name}.`,
            },
          }
        : {}),
      flavorTags,
    };
  }

  async chatWithBarista(
    userMessage: string,
    previousContext?: string,
    branchId?: string,
  ): Promise<{
    reply: string;
    suggestedAction: string;
    recommendedProductId: string;
  }> {
    const combinedQuery = `${previousContext ?? ''} ${userMessage}`.trim();
    const profile = this.inferProfileFromQuery(combinedQuery);
    const recommendation = await this.recommend({
      branchId,
      userQuery: combinedQuery,
      tasteProfile: profile,
    });
    const product = recommendation.highlightedProducts[0];
    return {
      reply: `Saya merekomendasikan **${product.name}** — ${product.description}`,
      suggestedAction: `ORDER_${profile.toUpperCase()}`,
      recommendedProductId: product.id,
    };
  }

  private scoreProduct(
    product: CatalogProduct,
    profile: FlavorProfile,
    dto: RecommendationRequestDto,
  ): number {
    const haystack = [
      product.name,
      product.description,
      product.category.name,
      ...product.tags,
      ...(dto.preferences ?? []),
      dto.userQuery ?? '',
    ]
      .join(' ')
      .toLowerCase();
    const keywordScore = PROFILE_KEYWORDS[profile.id].reduce(
      (score, keyword) => score + (haystack.includes(keyword) ? 3 : 0),
      0,
    );
    const namedRecommendationScore = profile.recommendedProducts.some((name) =>
      product.name.toLowerCase().includes(name.toLowerCase()),
    )
      ? 10
      : 0;
    return keywordScore + namedRecommendationScore + Number(product.isPopular);
  }

  private isFoodCategory(product: CatalogProduct): boolean {
    const category = product.category.slug.toLowerCase();
    return ['snacks', 'main-course', 'desserts'].includes(category);
  }

  private inferProfileFromQuery(query: string): TasteProfile {
    const normalized = query.toLowerCase();
    const matches = Object.entries(PROFILE_KEYWORDS).map(
      ([profile, keywords]) => ({
        profile: profile as TasteProfile,
        score: keywords.filter((keyword) => normalized.includes(keyword))
          .length,
      }),
    );
    matches.sort((left, right) => right.score - left.score);
    return matches[0].score > 0
      ? matches[0].profile
      : TasteProfile.SWEET_CREAMY;
  }

  private readonly titleCase = (value: string): string =>
    value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
