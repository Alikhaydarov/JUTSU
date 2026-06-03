export const locales = ["uz", "ru", "en", "ko"] as const;
export type Locale = (typeof locales)[number];

export type LocalizedText = Record<Locale, string>;

export type City = {
  slug: string;
  name: LocalizedText;
  province: LocalizedText;
  accent: string;
};

export type SourceState =
  | "connected"
  | "ready"
  | "fallback"
  | "needs-key"
  | "pending"
  | "error";

export type SourceStatus = {
  id: string;
  label: string;
  state: SourceState;
  detail: string;
  url?: string;
};

export type Product = {
  id: string;
  name: LocalizedText;
  citySlug: string;
  category:
    | "phone"
    | "laptop"
    | "home"
    | "appliance"
    | "accessory"
    | "clothing"
    | "shoes"
    | "furniture";
  condition: "new" | "used" | "refurbished";
  priceKrw: number;
  imageUrl: string;
  brand?: string;
  size?: string;
  color?: string;
  stock?: number;
  tags?: string[];
  optionSummary?: LocalizedText;
  sellerName: string;
  trustLevel: "verified" | "community" | "demo";
  contact: string;
  source: string;
};

export type Restaurant = {
  id: string;
  name: LocalizedText;
  citySlug: string;
  cuisine: "korean" | "halal" | "central-asian" | "cafe" | "fast";
  priceBand: "budget" | "mid" | "premium";
  halalFriendly: boolean;
  rating: number;
  imageUrl: string;
  address: LocalizedText;
  menuHighlights: LocalizedText[];
  contact: string;
  source: string;
};

export type Guide = {
  id: string;
  citySlug: string;
  category: "setup" | "shopping" | "food" | "clothing";
  title: LocalizedText;
  summary: LocalizedText;
};

export type FoodIdea = {
  id: string;
  title: string;
  imageUrl: string;
  source: string;
};

export type CatalogData = {
  cities: City[];
  selectedCity: string;
  products: Product[];
  restaurants: Restaurant[];
  guides: Guide[];
  foodIdeas: FoodIdea[];
  sources: SourceStatus[];
  updatedAt: string;
};
