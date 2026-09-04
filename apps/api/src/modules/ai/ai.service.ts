import { Injectable, Logger } from '@nestjs/common';

export interface FlavorProfile {
  id: string;
  name: string;
  description: string;
  recommendedProducts: string[];
  suggestedPairings: string[];
}

export interface RecommendationRequest {
  preferences?: string[];
  tasteProfile?:
    | 'sweet_creamy'
    | 'fruity_acidic'
    | 'bold_chocolatey'
    | 'spiced_herbal'
    | 'refreshing';
  currentCartItems?: string[];
  userQuery?: string;
}

export interface RecommendationResult {
  message: string;
  highlightedProducts: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    description: string;
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

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  // Flavor matrix with curated Indonesian specialty coffee profiles & snack pairings
  private readonly flavorMatrix: Record<string, FlavorProfile> = {
    sweet_creamy: {
      id: 'sweet_creamy',
      name: 'Manis & Creamy (Comforting)',
      description:
        'Perpaduan espresso lembut dengan gula aren organik dan fresh milk pilihan.',
      recommendedProducts: [
        'Kopi Susu Aren Signature',
        'Caramel Macchiato',
        'Premium Matcha Latte',
      ],
      suggestedPairings: ['Tahu Walik Crispy', 'Cireng Salju Rujak'],
    },
    fruity_acidic: {
      id: 'fruity_acidic',
      name: 'Fruity & Bright Acidity',
      description:
        'Single origin dengan profil floral, berry, dan aroma buah segar yang menyegarkan.',
      recommendedProducts: [
        'V60 Single Origin Ijen Strawberry',
        'V60 Toraja Sapan',
        'Cold Brew Citrus Peach',
      ],
      suggestedPairings: ['Croissant Butter', 'Pisang Goreng Keju'],
    },
    bold_chocolatey: {
      id: 'bold_chocolatey',
      name: 'Bold, Dark Chocolate & Nutty',
      description:
        'Ekstraksi pekat dengan body tebal, rasa dark chocolate, karamel matang, dan roasted almond.',
      recommendedProducts: [
        'Espresso Double Shot',
        'Americano Robusta Dampit',
        "Kopi Tubruk Ya'reh",
      ],
      suggestedPairings: ["Nasi Goreng Ya'reh", 'Roti Bakar Coklat Keju'],
    },
    refreshing: {
      id: 'refreshing',
      name: 'Segar & Ringan (Low Caffeine)',
      description:
        'Pilihan non-kopi atau mocktail dingin untuk menyegarkan hari di tengah cuaca Surabaya.',
      recommendedProducts: [
        'Es Teh Manis Jumbo',
        'Berry Mint Mocktail',
        'Yuzu Sparkling Tea',
      ],
      suggestedPairings: ['Kentang Goreng Truffle', 'Tahu Walik Crispy'],
    },
  };

  private readonly catalogProducts = [
    {
      id: 'p1',
      name: 'Kopi Susu Aren Signature',
      category: 'Coffee',
      price: 28000,
      description:
        'Espresso blend Arabica-Robusta dengan gula aren murni Tuban dan susu segar.',
      flavorNotes: ['Aren', 'Creamy', 'Caramel'],
    },
    {
      id: 'p2',
      name: 'V60 Single Origin Toraja Sapan',
      category: 'Manual Brew',
      price: 38000,
      description:
        'Seduhan manual filter V60 dengan notes red apple, dark berry, dan floral clean finish.',
      flavorNotes: ['Floral', 'Red Apple', 'Clean Finish'],
    },
    {
      id: 'p3',
      name: 'V60 Single Origin Ijen Strawberry',
      category: 'Manual Brew',
      price: 38000,
      description:
        'Proses natural anaerobic menghadirkan rasa manis asam stroberi yang intens dan harum.',
      flavorNotes: ['Strawberry', 'Winey', 'Citrus'],
    },
    {
      id: 'p4',
      name: 'Premium Matcha Latte',
      category: 'Non-Coffee',
      price: 35000,
      description:
        'Matcha Uji Kyoto grade A berpadu dengan susu steamed lembut.',
      flavorNotes: ['Uji Matcha', 'Creamy', 'Earthy'],
    },
    {
      id: 'p5',
      name: 'Cold Brew Citrus Peach',
      category: 'Coffee',
      price: 34000,
      description:
        'Cold brew 16 jam dengan infusi potongan peach segar dan perasan jeruk nipis lokal.',
      flavorNotes: ['Peach', 'Citrus', 'Crisp'],
    },
    {
      id: 'p6',
      name: 'Americano Robusta Dampit',
      category: 'Coffee',
      price: 22000,
      description:
        'Robusta murni lereng Semeru Dampit Malang dengan aroma nutty pekat dan kafein mantap.',
      flavorNotes: ['Dark Chocolate', 'Nutty', 'High Caffeine'],
    },
  ];

  private readonly snackPairings = [
    {
      id: 's1',
      name: 'Tahu Walik Crispy',
      price: 18000,
      reason: 'Gurih renyah menyeimbangkan rasa manis kopi susu.',
    },
    {
      id: 's2',
      name: 'Cireng Salju Rujak',
      price: 16000,
      reason: 'Sensasi pedas manis sambal rujak cocok menemani manual brew.',
    },
    {
      id: 's3',
      name: "Nasi Goreng Ya'reh",
      price: 38000,
      reason: 'Porsi lengkap dan mantap untuk teman begadang kerja/diskusi.',
    },
    {
      id: 's4',
      name: 'Croissant Butter',
      price: 24000,
      reason:
        'Tekstur flaky buttery sempurna untuk dinikmati bersama espresso base.',
    },
  ];

  async getFlavorProfiles(): Promise<FlavorProfile[]> {
    return Object.values(this.flavorMatrix);
  }

  async recommend(dto: RecommendationRequest): Promise<RecommendationResult> {
    const profileKey =
      dto.tasteProfile || this.inferProfileFromQuery(dto.userQuery || '');
    const profile =
      this.flavorMatrix[profileKey] || this.flavorMatrix.sweet_creamy;

    // Filter matching products from catalog
    const matchedProducts = this.catalogProducts.filter((p) =>
      profile.recommendedProducts.some((rec) => {
        const recWords = rec
          .toLowerCase()
          .split(' ')
          .filter((w) => w.length > 3);
        return recWords.some(
          (w) =>
            p.name.toLowerCase().includes(w) ||
            p.flavorNotes.some((f) => f.toLowerCase().includes(w)),
        );
      }),
    );

    // Pick top pairings
    const highlighted = (
      matchedProducts.length > 0
        ? matchedProducts
        : this.catalogProducts.slice(0, 2)
    ).map((p) => ({
      ...p,
      pairingReason: `Cocok untuk kamu yang menyukai sensasi ${profile.name.toLowerCase()}.`,
    }));

    // Pick appropriate snack pairing
    const snack =
      this.snackPairings.find((s) =>
        profile.suggestedPairings.includes(s.name),
      ) || this.snackPairings[0];

    const message = dto.userQuery
      ? `Berdasarkan preferensimu ("${dto.userQuery}"), Barista AI merekomendasikan racikan ${highlighted[0]?.name || 'Signature Brew'}!`
      : `Rekomendasi Barista untuk profil ${profile.name}:`;

    return {
      message,
      highlightedProducts: highlighted,
      pairingSnack: snack,
      flavorTags: profile.recommendedProducts.flatMap((name) => {
        const prod = this.catalogProducts.find((p) => p.name === name);
        return prod?.flavorNotes || [];
      }),
    };
  }

  async chatWithBarista(
    userMessage: string,
    previousContext?: string,
  ): Promise<{
    reply: string;
    suggestedAction?: string;
    recommendedProductId?: string;
  }> {
    const lower = userMessage.toLowerCase();

    if (
      lower.includes('non kopi') ||
      lower.includes('bukan kopi') ||
      lower.includes('tidak minum kopi') ||
      lower.includes('matcha') ||
      lower.includes('teh') ||
      lower.includes('mocktail')
    ) {
      return {
        reply:
          'Tenang, ada **Premium Matcha Latte** dari Uji Kyoto atau **Berry Mint Mocktail** dingin yang bebas kafein tinggi dan sangat menyegarkan!',
        suggestedAction: 'ORDER_NON_COFFEE',
        recommendedProductId: 'p4',
      };
    }

    if (
      lower.includes('ngantuk') ||
      lower.includes('begadang') ||
      lower.includes('kafein') ||
      lower.includes('kuat') ||
      lower.includes('pahit')
    ) {
      return {
        reply:
          "Untuk booster fokus dan melek maksimal, Barista sarankan **Americano Robusta Dampit** (ekstra kafein tinggi dari lereng Semeru) atau **Double Espresso Ya'reh**. Mau ditambahkan ke pesanan?",
        suggestedAction: 'ORDER_BOLD',
        recommendedProductId: 'p6',
      };
    }

    if (
      lower.includes('asam') ||
      lower.includes('asem') ||
      lower.includes('fruity') ||
      lower.includes('v60') ||
      lower.includes('manual') ||
      lower.includes('strawberry') ||
      lower.includes('segar')
    ) {
      return {
        reply:
          'Pencinta acidity segar wajib coba **V60 Ijen Strawberry Natural** — aroma stroberi dan peach-nya sangat semerbak dengan aftertaste yang clean & manis.',
        suggestedAction: 'ORDER_MANUAL_BREW',
        recommendedProductId: 'p3',
      };
    }

    if (
      lower.includes('manis') ||
      lower.includes('creamy') ||
      lower.includes('susu') ||
      lower.includes('santai') ||
      lower.includes('enak')
    ) {
      return {
        reply:
          'Pilihan paling pas untuk santai adalah **Kopi Susu Aren Signature** kami yang creamy dengan gula aren murni Tuban! Padukan dengan **Tahu Walik Crispy** untuk camilan gurih yang pas.',
        suggestedAction: 'ORDER_SIGNATURE',
        recommendedProductId: 'p1',
      };
    }

    return {
      reply:
        "Halo! Saya Barista AI Warkop Ya'reh. Ceritakan seleramu hari ini — apakah kamu mencari kopi manis creamy, manual brew fruity dengan V60, espresso bold berkafein tinggi, atau minuman segar non-kopi?",
      suggestedAction: 'EXPLORE_PROFILES',
    };
  }

  private inferProfileFromQuery(query: string): string {
    const q = query.toLowerCase();
    if (
      q.includes('asam') ||
      q.includes('asem') ||
      q.includes('fruity') ||
      q.includes('v60') ||
      q.includes('filter') ||
      q.includes('strawberry')
    )
      return 'fruity_acidic';
    if (
      q.includes('pahit') ||
      q.includes('bold') ||
      q.includes('begadang') ||
      q.includes('kuat') ||
      q.includes('kafein') ||
      q.includes('ngantuk')
    )
      return 'bold_chocolatey';
    if (
      q.includes('non kopi') ||
      q.includes('segar') ||
      q.includes('mocktail') ||
      q.includes('dingin') ||
      q.includes('teh')
    )
      return 'refreshing';
    return 'sweet_creamy';
  }
}
