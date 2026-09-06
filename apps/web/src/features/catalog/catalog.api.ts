import type { Product, ProductCustomization } from '@warkop-yareh/types';
import { api } from '@/lib/api';
import type {
  ApiEnvelope,
  BranchDto,
  CatalogProductDto,
  CustomizationOptionDto,
  FullCatalogDto,
} from '@/features/api/contracts';

const PRODUCT_FALLBACK_IMAGE = '/images/cold-brew-aren-brulee.png';

export async function getBranches(): Promise<BranchDto[]> {
  const response = await api.get<ApiEnvelope<BranchDto[]>>('/branches');
  return response.data.data;
}

export async function getCatalog(branchId: string): Promise<FullCatalogDto> {
  const response = await api.get<ApiEnvelope<FullCatalogDto>>('/catalog', {
    params: { branchId },
  });
  return response.data.data;
}

function parseCustomizationOptions(value: unknown): CustomizationOptionDto[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((option) => {
    if (!option || typeof option !== 'object' || !('label' in option)) return [];
    const label = Reflect.get(option, 'label');
    const rawPrice = Reflect.get(option, 'price');
    const price = typeof rawPrice === 'number' ? rawPrice : 0;
    if (
      typeof label !== 'string' ||
      !label.trim() ||
      !Number.isSafeInteger(price) ||
      price < 0
    ) {
      return [];
    }
    return [{ label, price }];
  });
}

export function toUiProduct(
  product: CatalogProductDto,
  branchId: string,
): Product {
  const customizations: ProductCustomization[] = product.customizations
    .map((definition) => ({
      id: definition.id,
      name: definition.name,
      options: parseCustomizationOptions(definition.options),
    }))
    .filter((definition) => definition.options.length > 0);

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    ...(product.originalPrice !== null
      ? { originalPrice: product.originalPrice }
      : {}),
    image: product.image || PRODUCT_FALLBACK_IMAGE,
    category: product.category.slug,
    tags: product.tags,
    isPopular: product.isPopular,
    isNew: product.isNew,
    rating: product.rating,
    reviewCount: product.reviewCount,
    preparationTime: product.preparationTime,
    ...(product.calories !== null ? { calories: product.calories } : {}),
    ingredients: product.ingredients,
    customizations,
    branchAvailability: [branchId],
  };
}

