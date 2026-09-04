export class RecommendationRequestDto {
  preferences?: string[];
  tasteProfile?: 'sweet_creamy' | 'fruity_acidic' | 'bold_chocolatey' | 'spiced_herbal' | 'refreshing';
  currentCartItems?: string[];
  userQuery?: string;
}

export class BaristaChatDto {
  message!: string;
  context?: string;
}
