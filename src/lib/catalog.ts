import { cities, guides, products, restaurants } from "./demo-data";
import {
  CatalogData,
  City,
  FoodIdea,
  Guide,
  Locale,
  Product,
  Restaurant,
  SourceStatus,
} from "./types";

type CatalogRequest = {
  locale: Locale;
  citySlug: string;
};

type DjangoCatalog = {
  products: Product[];
  restaurants: Restaurant[];
  guides: Guide[];
};

const DUMMY_PRODUCTS_URL =
  "https://dummyjson.com/products/search?q=phone&limit=6";
const MEALDB_KOREAN_URL =
  "https://www.themealdb.com/api/json/v1/1/filter.php?a=Korean";

export async function getCatalogData({
  locale,
  citySlug,
}: CatalogRequest): Promise<CatalogData> {
  const selectedCity = cities.some((city) => city.slug === citySlug)
    ? citySlug
    : "seoul";
  const selectedCityData =
    cities.find((city) => city.slug === selectedCity) ?? cities[0];

  const [djangoCatalog, dummyProducts, foodIdeas] = await Promise.all([
    getDjangoCatalog({ locale, citySlug: selectedCity }),
    getDummyProducts(selectedCity),
    getFoodIdeas(),
  ]);

  const cityProducts = products.filter(
    (product) => product.citySlug === selectedCity
  );
  const cityRestaurants = restaurants.filter(
    (restaurant) => restaurant.citySlug === selectedCity
  );
  const cityGuides = guides.filter((guide) => guide.citySlug === selectedCity);

  const localProducts = cityProducts.length
    ? cityProducts
    : buildFallbackProducts(selectedCityData);
  const finalProducts = djangoCatalog?.products.length
    ? djangoCatalog.products
    : [...localProducts, ...dummyProducts];
  const finalRestaurants = djangoCatalog?.restaurants.length
    ? djangoCatalog.restaurants
    : cityRestaurants.length
      ? cityRestaurants
      : buildFallbackRestaurants(selectedCityData);
  const finalGuides = djangoCatalog?.guides.length
    ? djangoCatalog.guides
    : cityGuides.length
      ? cityGuides
      : buildFallbackGuides(selectedCityData);

  return {
    cities,
    selectedCity,
    products: finalProducts,
    restaurants: finalRestaurants,
    guides: finalGuides,
    foodIdeas,
    sources: buildSources(Boolean(djangoCatalog), dummyProducts, foodIdeas),
    updatedAt: new Date().toISOString(),
  };
}

async function getDjangoCatalog({
  locale,
  citySlug,
}: CatalogRequest): Promise<DjangoCatalog | null> {
  const baseUrl = process.env.DJANGO_API_URL;

  if (!baseUrl) {
    return null;
  }

  try {
    const cleanBase = baseUrl.replace(/\/$/, "");
    const [productsResponse, restaurantsResponse, guidesResponse] =
      await Promise.all([
        fetchWithTimeout(
          `${cleanBase}/api/products/?city=${citySlug}&lang=${locale}`,
          { cache: "no-store" }
        ),
        fetchWithTimeout(
          `${cleanBase}/api/restaurants/?city=${citySlug}&lang=${locale}`,
          { cache: "no-store" }
        ),
        fetchWithTimeout(
          `${cleanBase}/api/guides/?city=${citySlug}&lang=${locale}`,
          {
            cache: "no-store",
          }
        ),
      ]);

    if (!productsResponse.ok || !restaurantsResponse.ok) {
      return null;
    }

    const [productRows, restaurantRows, guideRows] = await Promise.all([
      productsResponse.json(),
      restaurantsResponse.json(),
      guidesResponse.ok ? guidesResponse.json() : Promise.resolve([]),
    ]);

    return {
      products: Array.isArray(productRows)
        ? productRows
            .map((item) => toProduct(item, citySlug))
            .filter(isProduct)
        : [],
      restaurants: Array.isArray(restaurantRows)
        ? restaurantRows
            .map((item) => toRestaurant(item, citySlug))
            .filter(isRestaurant)
        : [],
      guides: Array.isArray(guideRows) ? guideRows : [],
    };
  } catch {
    return null;
  }
}

async function getDummyProducts(citySlug: string): Promise<Product[]> {
  try {
    const response = await fetchWithTimeout(DUMMY_PRODUCTS_URL, {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const rows: Array<Record<string, unknown>> = Array.isArray(data.products)
      ? data.products
      : [];

    return rows.slice(0, 4).map((item) => {
      const priceKrw = Math.max(25000, Math.round(Number(item.price) * 1350));
      const title = String(item.title ?? "Demo tech product");
      const imageUrl =
        String(item.thumbnail ?? "") ||
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80";

      return {
        id: `dummy-${item.id}`,
        name: {
          uz: `${title} demo API`,
          ru: `${title} demo API`,
          en: `${title} demo API`,
          ko: `${title} 데모 API`,
        },
        citySlug,
        category: "phone",
        condition: "new",
        priceKrw,
        imageUrl,
        brand: String(item.brand ?? "Demo brand"),
        color: "API",
        stock: Math.max(1, Math.round(Number(item.stock ?? 3))),
        tags: ["api", "tech", "demo"],
        optionSummary: {
          uz: "DummyJSON orqali vaqtinchalik API mahsuloti",
          ru: "Temporary API product from DummyJSON",
          en: "Temporary API product from DummyJSON",
          ko: "Temporary API product from DummyJSON",
        },
        sellerName: "DummyJSON public API",
        trustLevel: "demo",
        contact: "https://dummyjson.com",
        source: "DummyJSON",
      } satisfies Product;
    });
  } catch {
    return [];
  }
}

async function getFoodIdeas(): Promise<FoodIdea[]> {
  try {
    const response = await fetchWithTimeout(MEALDB_KOREAN_URL, {
      cache: "no-store",
    });

    if (!response.ok) {
      return fallbackFoodIdeas();
    }

    const data = await response.json();
    const rows: Array<Record<string, unknown>> = Array.isArray(data.meals)
      ? data.meals
      : [];

    if (!rows.length) {
      return fallbackFoodIdeas();
    }

    return rows.slice(0, 6).map((meal) => ({
      id: String(meal.idMeal),
      title: String(meal.strMeal),
      imageUrl: String(meal.strMealThumb),
      source: "TheMealDB",
    }));
  } catch {
    return fallbackFoodIdeas();
  }
}

function buildFallbackProducts(city: City): Product[] {
  const cityName = city.name.en;

  return [
    {
      id: `${city.slug}-starter-phone`,
      name: {
        uz: `${cityName}: SIM-free starter phone`,
        ru: `${cityName}: SIM-free starter phone`,
        en: `${cityName}: SIM-free starter phone`,
        ko: `${cityName}: SIM-free starter phone`,
      },
      citySlug: city.slug,
      category: "phone",
      condition: "refurbished",
      priceKrw: 230000,
      imageUrl:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
      brand: "Samsung",
      color: "Graphite",
      stock: 3,
      tags: ["phone", "starter", "sim-free"],
      optionSummary: {
        uz: "128GB, charger bor, SIM-free",
        ru: "128GB, charger included, SIM-free",
        en: "128GB, charger included, SIM-free",
        ko: "128GB, charger included, SIM-free",
      },
      sellerName: `${cityName} Mobile Desk`,
      trustLevel: "community",
      contact: "JUTSU request",
      source: "JUTSU city fallback",
    },
    {
      id: `${city.slug}-starter-clothing`,
      name: {
        uz: `${cityName}: hoodie va basic top`,
        ru: `${cityName}: hoodie and basic top`,
        en: `${cityName}: hoodie and basic top`,
        ko: `${cityName}: hoodie and basic top`,
      },
      citySlug: city.slug,
      category: "clothing",
      condition: "new",
      priceKrw: 42000,
      imageUrl:
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80",
      brand: "JUTSU Basic",
      size: "M / L / XL",
      color: "Grey",
      stock: 12,
      tags: ["clothing", "hoodie", "basic"],
      optionSummary: {
        uz: "M-L-XL, kundalik kiyim uchun",
        ru: "M-L-XL, for daily wear",
        en: "M-L-XL, for daily wear",
        ko: "M-L-XL, for daily wear",
      },
      sellerName: `${cityName} Fashion Desk`,
      trustLevel: "verified",
      contact: "JUTSU request",
      source: "JUTSU city fallback",
    },
    {
      id: `${city.slug}-starter-shoes`,
      name: {
        uz: `${cityName}: daily sneakers`,
        ru: `${cityName}: daily sneakers`,
        en: `${cityName}: daily sneakers`,
        ko: `${cityName}: daily sneakers`,
      },
      citySlug: city.slug,
      category: "shoes",
      condition: "new",
      priceKrw: 65000,
      imageUrl:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
      brand: "Daily Step",
      size: "240-285mm",
      color: "White",
      stock: 10,
      tags: ["shoes", "sneakers", "walking"],
      optionSummary: {
        uz: "240-285mm, ko'p yurishga qulay",
        ru: "240-285mm, comfortable for walking",
        en: "240-285mm, comfortable for walking",
        ko: "240-285mm, comfortable for walking",
      },
      sellerName: `${cityName} Street Gear`,
      trustLevel: "community",
      contact: "JUTSU request",
      source: "JUTSU city fallback",
    },
    {
      id: `${city.slug}-starter-kitchen`,
      name: {
        uz: `${cityName}: mini oshxona seti`,
        ru: `${cityName}: mini kitchen set`,
        en: `${cityName}: mini kitchen set`,
        ko: `${cityName}: mini kitchen set`,
      },
      citySlug: city.slug,
      category: "appliance",
      condition: "new",
      priceKrw: 76000,
      imageUrl:
        "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80",
      brand: "CookMate",
      color: "Steel",
      stock: 7,
      tags: ["kitchen", "pan", "starter"],
      optionSummary: {
        uz: "Pan, pot, knife, spoon set",
        ru: "Pan, pot, knife, spoon set",
        en: "Pan, pot, knife, spoon set",
        ko: "Pan, pot, knife, spoon set",
      },
      sellerName: `${cityName} Kitchen Kit`,
      trustLevel: "verified",
      contact: "JUTSU request",
      source: "JUTSU city fallback",
    },
    {
      id: `${city.slug}-starter-bedding`,
      name: {
        uz: `${cityName}: bedding starter pack`,
        ru: `${cityName}: bedding starter pack`,
        en: `${cityName}: bedding starter pack`,
        ko: `${cityName}: bedding starter pack`,
      },
      citySlug: city.slug,
      category: "home",
      condition: "new",
      priceKrw: 59000,
      imageUrl:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      brand: "RoomFit",
      size: "Single",
      color: "Ivory",
      stock: 9,
      tags: ["room", "bedding", "starter"],
      optionSummary: {
        uz: "Single blanket, pillow, cover",
        ru: "Single blanket, pillow, cover",
        en: "Single blanket, pillow, cover",
        ko: "Single blanket, pillow, cover",
      },
      sellerName: `${cityName} Room Starter`,
      trustLevel: "verified",
      contact: "JUTSU request",
      source: "JUTSU city fallback",
    },
  ];
}

function fallbackFoodIdeas(): FoodIdea[] {
  return [
    {
      id: "fallback-bibimbap",
      title: "Bibimbap",
      imageUrl:
        "https://images.unsplash.com/photo-1553163147-622ab57be1c7?auto=format&fit=crop&w=900&q=80",
      source: "Fallback",
    },
    {
      id: "fallback-kimbap",
      title: "Gimbap",
      imageUrl:
        "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=900&q=80",
      source: "Fallback",
    },
  ];
}

function buildFallbackRestaurants(city: City): Restaurant[] {
  const cityName = city.name.en;

  return [
    {
      id: `${city.slug}-jutsu-local-table`,
      name: {
        uz: `${cityName} Local Table`,
        ru: `${cityName} Local Table`,
        en: `${cityName} Local Table`,
        ko: `${cityName} Local Table`,
      },
      citySlug: city.slug,
      cuisine: "korean",
      priceBand: "budget",
      halalFriendly: false,
      rating: 4.2,
      imageUrl:
        "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=900&q=80",
      address: {
        uz: `${cityName}, ${city.province.en}`,
        ru: `${cityName}, ${city.province.en}`,
        en: `${cityName}, ${city.province.en}`,
        ko: `${cityName}, ${city.province.en}`,
      },
      menuHighlights: [
        {
          uz: "Korean lunch set",
          ru: "Korean lunch set",
          en: "Korean lunch set",
          ko: "Korean lunch set",
        },
        {
          uz: "Budget meal",
          ru: "Budget meal",
          en: "Budget meal",
          ko: "Budget meal",
        },
      ],
      contact: "JUTSU request",
      source: "JUTSU city fallback",
    },
    {
      id: `${city.slug}-jutsu-cafe`,
      name: {
        uz: `${cityName} Arrival Cafe`,
        ru: `${cityName} Arrival Cafe`,
        en: `${cityName} Arrival Cafe`,
        ko: `${cityName} Arrival Cafe`,
      },
      citySlug: city.slug,
      cuisine: "cafe",
      priceBand: "mid",
      halalFriendly: false,
      rating: 4.0,
      imageUrl:
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
      address: {
        uz: `${cityName} center`,
        ru: `${cityName} center`,
        en: `${cityName} center`,
        ko: `${cityName} center`,
      },
      menuHighlights: [
        { uz: "Coffee", ru: "Coffee", en: "Coffee", ko: "Coffee" },
        { uz: "Sandwich", ru: "Sandwich", en: "Sandwich", ko: "Sandwich" },
      ],
      contact: "JUTSU request",
      source: "JUTSU city fallback",
    },
  ];
}

function buildFallbackGuides(city: City): Guide[] {
  const cityName = city.name.en;

  return [
    {
      id: `${city.slug}-starter-map`,
      citySlug: city.slug,
      category: "setup",
      title: {
        uz: `${cityName}: yangi kelganlar xaritasi`,
        ru: `${cityName}: newcomer map`,
        en: `${cityName}: newcomer map`,
        ko: `${cityName}: newcomer map`,
      },
      summary: {
        uz: "SIM, arzon texnika, kiyim-kechak, mini oshxona va birinchi ovqat joylarini bitta checklistga yig'ish.",
        ru: "SIM, budget tech, clothing, mini kitchen, and first food spots in one checklist.",
        en: "SIM, budget tech, clothing, mini kitchen, and first food spots in one checklist.",
        ko: "SIM, budget tech, clothing, mini kitchen, and first food spots in one checklist.",
      },
    },
    {
      id: `${city.slug}-safe-shopping`,
      citySlug: city.slug,
      category: "shopping",
      title: {
        uz: `${cityName}: xavfsiz xarid`,
        ru: `${cityName}: safe shopping`,
        en: `${cityName}: safe shopping`,
        ko: `${cityName}: safe shopping`,
      },
      summary: {
        uz: "Texnika, kiyim va oshxona buyumlarida narx, holat, o'lcham, kafolat va uchrashuv joyi bo'yicha qisqa qoida.",
        ru: "Quick rules for price, condition, size, warranty, and meeting spot when buying tech, clothing, and kitchen items.",
        en: "Quick rules for price, condition, size, warranty, and meeting spot when buying tech, clothing, and kitchen items.",
        ko: "Quick rules for price, condition, size, warranty, and meeting spot when buying tech, clothing, and kitchen items.",
      },
    },
  ];
}

function buildSources(
  hasDjango: boolean,
  dummyProducts: Product[],
  foodIdeas: FoodIdea[]
): SourceStatus[] {
  return [
    {
      id: "django",
      label: "Django REST",
      state: process.env.DJANGO_API_URL
        ? hasDjango
          ? "connected"
          : "error"
        : "pending",
      detail: process.env.DJANGO_API_URL
        ? hasDjango
          ? "Primary backend is connected."
          : "Django URL is set, but the API did not respond."
        : "Set DJANGO_API_URL when backend is ready.",
    },
    {
      id: "dummyjson",
      label: "DummyJSON",
      state: dummyProducts.length ? "ready" : "fallback",
      detail: dummyProducts.length
        ? "No-key demo product API is feeding tech cards."
        : "Product demo API failed, local curated data is used.",
      url: "https://dummyjson.com",
    },
    {
      id: "themealdb",
      label: "TheMealDB",
      state: foodIdeas.some((item) => item.source === "TheMealDB")
        ? "ready"
        : "fallback",
      detail: "No-key food API for menu inspiration.",
      url: "https://www.themealdb.com",
    },
    {
      id: "kakao",
      label: "Kakao Local",
      state: process.env.KAKAO_REST_API_KEY ? "ready" : "needs-key",
      detail: "Use for real Korean place search after API key setup.",
      url: "https://developers.kakao.com",
    },
    {
      id: "tourapi",
      label: "Korea TourAPI",
      state: process.env.KTO_SERVICE_KEY ? "ready" : "needs-key",
      detail: "Use for official restaurant and travel data after key setup.",
      url: "https://api.visitkorea.or.kr",
    },
  ];
}

function toProduct(
  item: Record<string, unknown>,
  citySlug: string
): Product | null {
  const id = stringField(item, "id");
  const name = stringField(item, "name") || stringField(item, "title");
  const price = Number(item.price_krw ?? item.priceKrw ?? item.price ?? 0);

  if (!id || !name || !price) {
    return null;
  }

  return {
    id,
    name: { uz: name, ru: name, en: name, ko: name },
    citySlug: stringField(item, "city") || citySlug,
    category: toProductCategory(stringField(item, "category")),
    condition: "used",
    priceKrw: price,
    imageUrl:
      stringField(item, "image") ||
      stringField(item, "imageUrl") ||
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
    brand: stringField(item, "brand") || undefined,
    size: stringField(item, "size") || undefined,
    color: stringField(item, "color") || undefined,
    stock: Number(item.stock ?? 1),
    tags: stringField(item, "tags")
      ? stringField(item, "tags").split(",").map((tag) => tag.trim())
      : [],
    optionSummary: {
      uz: stringField(item, "option_summary") || "Django listing",
      ru: stringField(item, "option_summary") || "Django listing",
      en: stringField(item, "option_summary") || "Django listing",
      ko: stringField(item, "option_summary") || "Django listing",
    },
    sellerName: stringField(item, "seller_name") || "Django seller",
    trustLevel: item.verified ? "verified" : "community",
    contact: stringField(item, "contact") || "Django contact",
    source: "Django REST",
  } satisfies Product;
}

function toRestaurant(
  item: Record<string, unknown>,
  citySlug: string
): Restaurant | null {
  const id = stringField(item, "id");
  const name = stringField(item, "name") || stringField(item, "title");

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name: { uz: name, ru: name, en: name, ko: name },
    citySlug: stringField(item, "city") || citySlug,
    cuisine: item.halal ? "halal" : "korean",
    priceBand: "mid",
    halalFriendly: Boolean(item.halal),
    rating: Number(item.rating ?? 4.3),
    imageUrl:
      stringField(item, "image") ||
      stringField(item, "imageUrl") ||
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
    address: {
      uz: stringField(item, "address") || "Korea",
      ru: stringField(item, "address") || "Korea",
      en: stringField(item, "address") || "Korea",
      ko: stringField(item, "address") || "Korea",
    },
    menuHighlights: [],
    contact: stringField(item, "contact") || "Django contact",
    source: "Django REST",
  } satisfies Restaurant;
}

function isProduct(item: Product | null): item is Product {
  return item !== null;
}

function isRestaurant(item: Restaurant | null): item is Restaurant {
  return item !== null;
}

function toProductCategory(value: string): Product["category"] {
  const normalized = value.toLowerCase();

  if (
    normalized === "clothing" ||
    normalized === "shoes" ||
    normalized === "furniture" ||
    normalized === "laptop" ||
    normalized === "home" ||
    normalized === "appliance" ||
    normalized === "accessory"
  ) {
    return normalized;
  }

  return "phone";
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs = 2500
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function stringField(item: Record<string, unknown>, key: string) {
  const value = item[key];
  return typeof value === "string" ? value : "";
}
