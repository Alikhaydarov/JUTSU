"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  Check,
  ChevronDown,
  CookingPot,
  CreditCard,
  Eye,
  EyeOff,
  Home,
  Laptop,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  MessageCircle,
  PackageCheck,
  PackageSearch,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Shirt,
  Star,
  Store,
  Tags,
  Utensils,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import { text } from "@/lib/i18n";
import {
  CatalogData,
  Guide,
  Locale,
  Product,
  Restaurant,
  locales,
} from "@/lib/types";

type CatalogAppProps = {
  initialData: CatalogData;
  locale: Locale;
};

type ActiveTab = "products" | "restaurants" | "guides";
type ProductGroup =
  | "all"
  | "tech"
  | "clothing"
  | "kitchen"
  | "room"
  | "accessories";
type AuthMode = "login" | "register";
type AuthIdentity = "email" | "phone";
type AccountRole = "buyer" | "seller";
type UserProfile = {
  name: string;
  email: string;
  phone?: string;
  role: AccountRole;
};
type PaymentMethod =
  | "card"
  | "toss"
  | "naverPay"
  | "kakaoPay"
  | "bankTransfer"
  | "cashOnPickup";

const paymentMethods: PaymentMethod[] = [
  "card",
  "toss",
  "naverPay",
  "kakaoPay",
  "bankTransfer",
  "cashOnPickup",
];

const productGroups: ProductGroup[] = [
  "all",
  "tech",
  "clothing",
  "kitchen",
  "room",
  "accessories",
];

export function CatalogApp({ initialData, locale }: CatalogAppProps) {
  const t = useTranslations("app");
  const router = useRouter();
  const [catalog, setCatalog] = useState(initialData);
  const [selectedCity, setSelectedCity] = useState(initialData.selectedCity);
  const [activeTab, setActiveTab] = useState<ActiveTab>("products");
  const [productGroup, setProductGroup] = useState<ProductGroup>("all");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("toss");
  const [deliveryMode, setDeliveryMode] = useState<"delivery" | "pickup">(
    "delivery"
  );
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    if (selectedCity === catalog.selectedCity) {
      return;
    }

    const controller = new AbortController();

    async function loadCatalog() {
      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/catalog?lang=${locale}&city=${selectedCity}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          return;
        }

        const nextCatalog = (await response.json()) as CatalogData;
        setCatalog(nextCatalog);
        router.replace(`/${locale}?city=${selectedCity}`, { scroll: false });
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadCatalog();

    return () => controller.abort();
  }, [catalog.selectedCity, locale, router, selectedCity]);

  const selectedCityData =
    catalog.cities.find((city) => city.slug === selectedCity) ??
    catalog.cities[0];

  const filteredProducts = useMemo(
    () => filterProducts(catalog.products, query, locale, productGroup),
    [catalog.products, locale, productGroup, query]
  );
  const filteredRestaurants = useMemo(
    () => filterRestaurants(catalog.restaurants, query, locale),
    [catalog.restaurants, locale, query]
  );
  const filteredGuides = useMemo(
    () => filterGuides(catalog.guides, query, locale),
    [catalog.guides, locale, query]
  );

  const currentCount =
    activeTab === "products"
      ? filteredProducts.length
      : activeTab === "restaurants"
        ? filteredRestaurants.length
        : filteredGuides.length;

  const startCheckout = (product: Product) => {
    setSelectedProduct(null);
    setCheckoutProduct(product);
    setOrderPlaced(false);
  };

  return (
    <main className="min-h-screen bg-[#fff8df] text-[#3a2400]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-lg border border-[#ead9a2] bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Image
              alt="JUTSU"
              height={48}
              priority
              src="/jutsu-logo.svg"
              width={160}
            />
            <div className="hidden h-8 w-px bg-[#ead9a2] sm:block" />
            <p className="hidden text-sm font-semibold text-[#7a5a15] sm:block">
              {t("tagline")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <span className="sr-only">{t("language")}</span>
              <select
                className="h-10 appearance-none rounded-lg border border-[#ead9a2] bg-[#fffdf5] pl-3 pr-9 text-sm font-bold outline-none transition focus:border-[#ffbc0d] focus:ring-4 focus:ring-[#ffbc0d]/25"
                onChange={(event) =>
                  router.replace(`/${event.target.value}?city=${selectedCity}`)
                }
                value={locale}
              >
                {locales.map((item) => (
                  <option key={item} value={item}>
                    {item.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#7a5a15]"
                aria-hidden
              />
            </label>

            {user ? (
              <button
                className="h-10 rounded-lg border border-[#ead9a2] bg-white px-3 text-sm font-bold text-[#3a2400]"
                onClick={() => setUser(null)}
                type="button"
              >
                {t("account")}: {user.name} ·{" "}
                {t(user.role === "seller" ? "sellerAccount" : "buyerAccount")}
              </button>
            ) : (
              <button
                className="h-10 rounded-lg bg-[#ffbc0d] px-4 text-sm font-black text-[#3a2400] shadow-sm shadow-[#ffbc0d]/30"
                onClick={() => {
                  setAuthMode("login");
                  setShowAuth(true);
                }}
                type="button"
              >
                {t("login")}
              </button>
            )}
          </div>
        </header>

        <section className="rounded-lg border border-[#ead9a2] bg-white p-3 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[260px_1fr_auto] lg:items-center">
            <label className="relative">
              <span className="sr-only">{t("city")}</span>
              <select
                className="h-12 w-full appearance-none rounded-lg border border-[#ead9a2] bg-[#fffdf5] pl-3 pr-9 text-sm font-bold outline-none transition focus:border-[#ffbc0d] focus:ring-4 focus:ring-[#ffbc0d]/25"
                onChange={(event) => setSelectedCity(event.target.value)}
                value={selectedCity}
              >
                {catalog.cities.map((city) => (
                  <option key={city.slug} value={city.slug}>
                    {text(city.name, locale)} - {text(city.province, locale)}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-[#7a5a15]"
                aria-hidden
              />
            </label>

            <label className="relative">
              <span className="sr-only">{t("search")}</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#7a5a15]"
                aria-hidden
              />
              <input
                className="h-12 w-full rounded-lg border border-[#ead9a2] bg-[#fffdf5] pl-10 pr-4 text-base outline-none transition placeholder:text-[#92784a] focus:border-[#ffbc0d] focus:ring-4 focus:ring-[#ffbc0d]/25"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
                type="search"
                value={query}
              />
            </label>

            <div className="grid grid-cols-3 gap-1 rounded-lg bg-[#fff2bf] p-1">
              <TabButton
                active={activeTab === "products"}
                icon={<Laptop className="size-4" />}
                label={t("products")}
                onClick={() => setActiveTab("products")}
              />
              <TabButton
                active={activeTab === "restaurants"}
                icon={<Utensils className="size-4" />}
                label={t("restaurants")}
                onClick={() => setActiveTab("restaurants")}
              />
              <TabButton
                active={activeTab === "guides"}
                icon={<BookOpen className="size-4" />}
                label={t("guides")}
                onClick={() => setActiveTab("guides")}
              />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black">
              {text(selectedCityData.name, locale)}
            </h1>
            <p className="text-sm font-medium text-[#7a5a15]">
              {t("allCities")} ·{" "}
              {activeTab === "products" ? t("marketNote") : t("newcomer")}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-[#7a5a15]">
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
            <span>
              {currentCount}{" "}
              {activeTab === "products"
                ? t("products")
                : activeTab === "restaurants"
                  ? t("restaurants")
                  : t("guides")}
            </span>
          </div>
        </div>

        {activeTab === "products" ? (
          <ProductGroupBar
            activeGroup={productGroup}
            onGroup={setProductGroup}
            t={t}
          />
        ) : null}

        {activeTab === "products" ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                locale={locale}
                onDetails={() => setSelectedProduct(product)}
                onOrder={() => startCheckout(product)}
                priority={index === 0}
                product={product}
                t={t}
              />
            ))}
          </div>
        ) : null}

        {activeTab === "restaurants" ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredRestaurants.map((restaurant, index) => (
              <RestaurantCard
                key={restaurant.id}
                locale={locale}
                priority={index === 0}
                restaurant={restaurant}
                t={t}
              />
            ))}
          </div>
        ) : null}

        {activeTab === "guides" ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredGuides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} locale={locale} />
            ))}
          </div>
        ) : null}

        {currentCount === 0 ? (
          <div className="rounded-lg border border-dashed border-[#e3c56a] bg-white p-8 text-center text-sm font-bold text-[#7a5a15]">
            {t("empty")}
          </div>
        ) : null}
      </div>

      {selectedProduct ? (
        <ProductModal
          locale={locale}
          onClose={() => setSelectedProduct(null)}
          onOrder={() => startCheckout(selectedProduct)}
          product={selectedProduct}
          t={t}
        />
      ) : null}

      {checkoutProduct ? (
        <CheckoutModal
          deliveryMode={deliveryMode}
          locale={locale}
          onClose={() => setCheckoutProduct(null)}
          onDeliveryMode={setDeliveryMode}
          onPaymentMethod={setPaymentMethod}
          onPlaceOrder={() => setOrderPlaced(true)}
          orderPlaced={orderPlaced}
          paymentMethod={paymentMethod}
          product={checkoutProduct}
          t={t}
          user={user}
        />
      ) : null}

      {showAuth ? (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onMode={setAuthMode}
          onSubmit={(profile) => {
            setUser(profile);
            setShowAuth(false);
            if (selectedProduct) {
              setCheckoutProduct(selectedProduct);
              setSelectedProduct(null);
              setOrderPlaced(false);
            }
          }}
          t={t}
        />
      ) : null}
    </main>
  );
}

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-black transition ${
        active ? "bg-[#ffbc0d] text-[#3a2400] shadow-sm" : "text-[#6f5724]"
      }`}
      onClick={onClick}
      type="button"
    >
      {icon}
      <span className="text-xs sm:text-sm">{label}</span>
    </button>
  );
}

function ProductGroupBar({
  activeGroup,
  onGroup,
  t,
}: {
  activeGroup: ProductGroup;
  onGroup: (group: ProductGroup) => void;
  t: ReturnType<typeof useTranslations<"app">>;
}) {
  return (
    <div className="rounded-lg border border-[#ead9a2] bg-white p-2 shadow-sm">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {productGroups.map((group) => {
          const Icon = getProductGroupIcon(group);
          const active = activeGroup === group;

          return (
            <button
              className={`flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-black transition ${
                active
                  ? "border-[#ffbc0d] bg-[#ffbc0d] text-[#3a2400] shadow-sm shadow-[#ffbc0d]/25"
                  : "border-[#ead9a2] bg-[#fffdf5] text-[#6f5724] hover:border-[#ffbc0d]"
              }`}
              key={group}
              onClick={() => onGroup(group)}
              type="button"
            >
              <Icon className="size-4" aria-hidden />
              {t(productGroupLabelKey(group))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProductCard({
  locale,
  onDetails,
  onOrder,
  priority,
  product,
  t,
}: {
  locale: Locale;
  onDetails: () => void;
  onOrder: () => void;
  priority: boolean;
  product: Product;
  t: ReturnType<typeof useTranslations<"app">>;
}) {
  return (
    <article className="overflow-hidden rounded-lg border border-[#ead9a2] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <button
        className="block w-full text-left"
        onClick={onDetails}
        type="button"
      >
        <div className="relative aspect-[4/3] bg-[#fff2bf]">
          <Image
            alt={text(product.name, locale)}
            className="object-cover"
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 33vw"
            src={product.imageUrl}
          />
          <span className="absolute left-3 top-3 rounded-md bg-white px-2 py-1 text-xs font-black">
            {t(product.condition)}
          </span>
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-[#3a2400] px-2 py-1 text-xs font-black text-white">
            <Tags className="size-3" aria-hidden />
            {t(productGroupLabelKey(getProductGroup(product)))}
          </span>
        </div>
      </button>
      <div className="flex min-h-64 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <button className="text-left" onClick={onDetails} type="button">
            <h2 className="line-clamp-2 text-lg font-black leading-6">
              {text(product.name, locale)}
            </h2>
          </button>
          <TrustBadge t={t} trust={product.trustLevel} />
        </div>
        <div className="flex items-center gap-2 text-xl font-black">
          <CreditCard className="size-5 text-[#f97316]" aria-hidden />
          {formatKrw(product.priceKrw)}
        </div>
        <p className="text-sm font-medium text-[#7a5a15]">
          {product.sellerName}
        </p>
        {product.optionSummary ? (
          <p className="line-clamp-2 text-sm font-semibold leading-5 text-[#5b3b07]">
            {text(product.optionSummary, locale)}
          </p>
        ) : null}
        <ProductSpecs product={product} t={t} />
        <div className="mt-auto grid grid-cols-2 gap-2">
          <button
            className="h-10 rounded-lg border border-[#ead9a2] text-sm font-black"
            onClick={onDetails}
            type="button"
          >
            {t("details")}
          </button>
          <button
            className="h-10 rounded-lg bg-[#ffbc0d] text-sm font-black text-[#3a2400] shadow-sm shadow-[#ffbc0d]/30"
            onClick={onOrder}
            type="button"
          >
            {t("order")}
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductSpecs({
  product,
  t,
}: {
  product: Product;
  t: ReturnType<typeof useTranslations<"app">>;
}) {
  const specs = [
    product.brand ? { label: t("brand"), value: product.brand } : null,
    product.size ? { label: t("size"), value: product.size } : null,
    product.color ? { label: t("color"), value: product.color } : null,
    typeof product.stock === "number"
      ? { label: t("stock"), value: `${product.stock} ${t("inStock")}` }
      : null,
  ].filter((item): item is { label: string; value: string } => item !== null);

  if (!specs.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      {specs.slice(0, 4).map((spec) => (
        <div
          className="min-w-0 rounded-md border border-[#f0df9f] bg-[#fffdf5] px-2 py-1.5"
          key={`${spec.label}-${spec.value}`}
        >
          <p className="font-bold text-[#8a6a20]">{spec.label}</p>
          <p className="truncate font-black text-[#3a2400]">{spec.value}</p>
        </div>
      ))}
    </div>
  );
}

function RestaurantCard({
  locale,
  priority,
  restaurant,
  t,
}: {
  locale: Locale;
  priority: boolean;
  restaurant: Restaurant;
  t: ReturnType<typeof useTranslations<"app">>;
}) {
  return (
    <article className="overflow-hidden rounded-lg border border-[#ead9a2] bg-white shadow-sm">
      <div className="relative aspect-[4/3] bg-[#e8eef2]">
        <Image
          alt={text(restaurant.name, locale)}
          className="object-cover"
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 33vw"
          src={restaurant.imageUrl}
        />
        {restaurant.halalFriendly ? (
          <span className="absolute left-3 top-3 rounded-md bg-[#ffbc0d] px-2 py-1 text-xs font-black text-[#3a2400]">
            {t("halal")}
          </span>
        ) : null}
      </div>
      <div className="flex min-h-52 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-lg font-black">
              {text(restaurant.name, locale)}
            </h2>
            <p className="mt-1 flex items-center gap-1 text-sm font-medium text-[#7a5a15]">
              <MapPin className="size-4 shrink-0 text-[#d62828]" aria-hidden />
              <span className="truncate">
                {text(restaurant.address, locale)}
              </span>
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#fff3df] px-2 py-1 text-xs font-black text-[#9a4d00]">
            <Star className="size-3 fill-current" aria-hidden />
            {restaurant.rating.toFixed(1)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-md bg-[#fff2bf] px-2 py-1 text-xs font-black text-[#3a2400]">
            {t(restaurant.priceBand)}
          </span>
          <span className="rounded-md bg-[#e7f7fb] px-2 py-1 text-xs font-black text-[#0e7490]">
            {restaurant.cuisine}
          </span>
        </div>
        <ul className="space-y-1 text-sm font-medium text-[#5b3b07]">
          {restaurant.menuHighlights.slice(0, 2).map((item) => (
            <li key={text(item, locale)}>{text(item, locale)}</li>
          ))}
        </ul>
        <span className="mt-auto inline-flex items-center gap-1 text-sm font-black text-[#0f766e]">
          <MessageCircle className="size-4" aria-hidden />
          {t("contact")}
        </span>
      </div>
    </article>
  );
}

function GuideCard({ guide, locale }: { guide: Guide; locale: Locale }) {
  return (
    <article className="rounded-lg border border-[#ead9a2] bg-white p-5 shadow-sm">
      <span className="rounded-md bg-[#ffbc0d] px-2 py-1 text-xs font-black text-[#3a2400]">
        {guide.category}
      </span>
      <h2 className="mt-4 text-lg font-black">{text(guide.title, locale)}</h2>
      <p className="mt-2 text-sm leading-6 text-[#7a5a15]">
        {text(guide.summary, locale)}
      </p>
    </article>
  );
}

function ProductModal({
  locale,
  onClose,
  onOrder,
  product,
  t,
}: {
  locale: Locale;
  onClose: () => void;
  onOrder: () => void;
  product: Product;
  t: ReturnType<typeof useTranslations<"app">>;
}) {
  return (
    <Modal onClose={onClose}>
      <div className="grid max-h-[88vh] overflow-y-auto lg:grid-cols-[1fr_380px]">
        <div className="relative min-h-80 bg-[#e8eef2]">
          <Image
            alt={text(product.name, locale)}
            className="object-cover"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            src={product.imageUrl}
          />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase text-[#7a5a15]">
                {t("productDetails")}
              </p>
              <h2 className="mt-2 text-2xl font-black leading-tight">
                {text(product.name, locale)}
              </h2>
            </div>
            <button
              className="grid size-10 place-items-center rounded-lg border border-[#ead9a2]"
              onClick={onClose}
              type="button"
              aria-label="Close"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <div className="mt-5 flex items-center gap-2 text-2xl font-black">
            <CreditCard className="size-6 text-[#f97316]" aria-hidden />
            {formatKrw(product.priceKrw)}
          </div>
          {product.optionSummary ? (
            <p className="mt-4 rounded-lg border border-[#f0df9f] bg-[#fffdf5] p-3 text-sm font-semibold leading-6 text-[#5b3b07]">
              {text(product.optionSummary, locale)}
            </p>
          ) : null}
          <dl className="mt-5 grid gap-3 text-sm">
            <InfoRow
              label={t("category")}
              value={t(productGroupLabelKey(getProductGroup(product)))}
            />
            {product.brand ? (
              <InfoRow label={t("brand")} value={product.brand} />
            ) : null}
            {product.size ? (
              <InfoRow label={t("size")} value={product.size} />
            ) : null}
            {product.color ? (
              <InfoRow label={t("color")} value={product.color} />
            ) : null}
            {typeof product.stock === "number" ? (
              <InfoRow
                label={t("stock")}
                value={`${product.stock} ${t("inStock")}`}
              />
            ) : null}
            <InfoRow label={t("seller")} value={product.sellerName} />
            <InfoRow label={t("condition")} value={t(product.condition)} />
            <InfoRow label="City" value={product.citySlug} />
            <InfoRow label="Source" value={product.source} />
          </dl>
          {product.tags?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.slice(0, 6).map((tag) => (
                <span
                  className="rounded-md bg-[#fff2bf] px-2 py-1 text-xs font-black text-[#3a2400]"
                  key={tag}
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
          <button
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#ffbc0d] text-sm font-black text-[#3a2400] shadow-sm shadow-[#ffbc0d]/30"
            onClick={onOrder}
            type="button"
          >
            <ShoppingBag className="size-5" aria-hidden />
            {t("order")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function CheckoutModal({
  deliveryMode,
  locale,
  onClose,
  onDeliveryMode,
  onPaymentMethod,
  onPlaceOrder,
  orderPlaced,
  paymentMethod,
  product,
  t,
  user,
}: {
  deliveryMode: "delivery" | "pickup";
  locale: Locale;
  onClose: () => void;
  onDeliveryMode: (mode: "delivery" | "pickup") => void;
  onPaymentMethod: (method: PaymentMethod) => void;
  onPlaceOrder: () => void;
  orderPlaced: boolean;
  paymentMethod: PaymentMethod;
  product: Product;
  t: ReturnType<typeof useTranslations<"app">>;
  user: UserProfile | null;
}) {
  return (
    <Modal onClose={onClose}>
      <div className="max-h-[88vh] overflow-y-auto p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase text-[#7a5a15]">
              {t("checkout")}
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {text(product.name, locale)}
            </h2>
          </div>
          <button
            className="grid size-10 place-items-center rounded-lg border border-[#ead9a2]"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <section>
              <h3 className="text-sm font-black">{t("buyer")}</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input
                  className="h-11 rounded-lg border border-[#ead9a2] px-3 text-sm font-semibold outline-none"
                  defaultValue={user?.name}
                  placeholder={t("name")}
                />
                <input
                  className="h-11 rounded-lg border border-[#ead9a2] px-3 text-sm font-semibold outline-none"
                  placeholder={t("phone")}
                />
                <input
                  className="h-11 rounded-lg border border-[#ead9a2] px-3 text-sm font-semibold outline-none sm:col-span-2"
                  placeholder={t("address")}
                />
              </div>
            </section>

            <section>
              <h3 className="text-sm font-black">{t("delivery")}</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <ChoiceButton
                  active={deliveryMode === "delivery"}
                  icon={<PackageCheck className="size-4" />}
                  label={t("delivery")}
                  onClick={() => onDeliveryMode("delivery")}
                />
                <ChoiceButton
                  active={deliveryMode === "pickup"}
                  icon={<MapPin className="size-4" />}
                  label={t("pickup")}
                  onClick={() => onDeliveryMode("pickup")}
                />
              </div>
            </section>

            <section>
              <h3 className="text-sm font-black">{t("paymentMethod")}</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {paymentMethods.map((method) => (
                  <ChoiceButton
                    active={paymentMethod === method}
                    icon={
                      method === "card" ? (
                        <CreditCard className="size-4" />
                      ) : (
                        <WalletCards className="size-4" />
                      )
                    }
                    key={method}
                    label={t(method)}
                    onClick={() => onPaymentMethod(method)}
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="rounded-lg border border-[#ead9a2] bg-[#fffdf5] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-black">{t("payment")}</span>
              <LockKeyhole className="size-4 text-[#0f766e]" aria-hidden />
            </div>
            <div className="mt-5 text-2xl font-black">
              {formatKrw(product.priceKrw)}
            </div>
            <p className="mt-2 text-sm font-medium text-[#7a5a15]">
              {t("apiSoon")}
            </p>
            <button
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#ffbc0d] text-sm font-black text-[#3a2400] shadow-sm shadow-[#ffbc0d]/30"
              onClick={onPlaceOrder}
              type="button"
            >
              {orderPlaced ? (
                <>
                  <Check className="size-5" aria-hidden />
                  {t("orderReady")}
                </>
              ) : (
                t("placeOrder")
              )}
            </button>
          </aside>
        </div>
      </div>
    </Modal>
  );
}

function AuthModal({
  mode,
  onClose,
  onMode,
  onSubmit,
  t,
}: {
  mode: AuthMode;
  onClose: () => void;
  onMode: (mode: AuthMode) => void;
  onSubmit: (profile: UserProfile) => void;
  t: ReturnType<typeof useTranslations<"app">>;
}) {
  const [name, setName] = useState("JUTSU User");
  const [email, setEmail] = useState("user@jutsu.app");
  const [phone, setPhone] = useState("01012345678");
  const [password, setPassword] = useState("jutsu2026");
  const [code, setCode] = useState("123456");
  const [identity, setIdentity] = useState<AuthIdentity>("email");
  const [role, setRole] = useState<AccountRole>("buyer");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const submitProfile = () => {
    const cleanPhone = phone.replace(/\D/g, "");
    const identityIsValid =
      identity === "email" ? email.includes("@") : cleanPhone.length >= 8;
    const passwordIsValid = password.length >= 8 && /\d/.test(password);

    if (!identityIsValid || !passwordIsValid) {
      setError(t("authError"));
      return;
    }

    onSubmit({
      name: name.trim() || "JUTSU User",
      email: identity === "email" ? email : `${cleanPhone}@phone.jutsu.app`,
      phone: identity === "phone" ? phone : undefined,
      role,
    });
  };

  const submitSocial = (provider: "Google" | "Kakao" | "Naver") => {
    onSubmit({
      name: `${provider} User`,
      email: `${provider.toLowerCase()}@jutsu.app`,
      role,
    });
  };

  return (
    <Modal onClose={onClose}>
      <form
        className="w-full max-w-lg p-5"
        onSubmit={(event) => {
          event.preventDefault();
          submitProfile();
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase text-[#7a5a15]">
              {mode === "login" ? t("login") : t("register")}
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {mode === "login" ? t("welcomeBack") : t("createAccount")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#7a5a15]">
              {t("authCopy")}
            </p>
          </div>
          <button
            className="grid size-10 place-items-center rounded-lg border border-[#ead9a2]"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-[#fff2bf] p-1">
          <button
            className={`h-10 rounded-md text-sm font-black ${
              mode === "login" ? "bg-[#ffbc0d] text-[#3a2400]" : "text-[#6f5724]"
            }`}
            onClick={() => {
              setError("");
              onMode("login");
            }}
            type="button"
          >
            {t("login")}
          </button>
          <button
            className={`h-10 rounded-md text-sm font-black ${
              mode === "register"
                ? "bg-[#ffbc0d] text-[#3a2400]"
                : "text-[#6f5724]"
            }`}
            onClick={() => {
              setError("");
              onMode("register");
            }}
            type="button"
          >
            {t("register")}
          </button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <button
            className="h-11 rounded-lg border border-[#ead9a2] bg-white text-sm font-black text-[#3a2400]"
            onClick={() => submitSocial("Google")}
            type="button"
          >
            {t("socialGoogle")}
          </button>
          <button
            className="h-11 rounded-lg border border-[#ead9a2] bg-white text-sm font-black text-[#3a2400]"
            onClick={() => submitSocial("Kakao")}
            type="button"
          >
            {t("socialKakao")}
          </button>
          <button
            className="h-11 rounded-lg border border-[#ead9a2] bg-white text-sm font-black text-[#3a2400]"
            onClick={() => submitSocial("Naver")}
            type="button"
          >
            {t("socialNaver")}
          </button>
        </div>

        <div className="my-4 flex items-center gap-3 text-xs font-black uppercase text-[#8a6a20]">
          <span className="h-px flex-1 bg-[#ead9a2]" />
          {t("orEmail")}
          <span className="h-px flex-1 bg-[#ead9a2]" />
        </div>

        {mode === "register" ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <AuthRoleButton
              active={role === "buyer"}
              description={t("buyerHint")}
              icon={<UserRound className="size-4" />}
              label={t("buyerAccount")}
              onClick={() => setRole("buyer")}
            />
            <AuthRoleButton
              active={role === "seller"}
              description={t("sellerHint")}
              icon={<Store className="size-4" />}
              label={t("sellerAccount")}
              onClick={() => setRole("seller")}
            />
          </div>
        ) : null}

        <div className="mt-4 space-y-3">
          {mode === "register" ? (
            <input
              autoComplete="name"
              className="h-11 w-full rounded-lg border border-[#ead9a2] bg-[#fffdf5] px-3 text-sm font-semibold outline-none focus:border-[#ffbc0d] focus:ring-4 focus:ring-[#ffbc0d]/25"
              onChange={(event) => setName(event.target.value)}
              placeholder={t("name")}
              value={name}
            />
          ) : null}

          <div className="grid grid-cols-2 gap-2 rounded-lg bg-[#fff2bf] p-1">
            <button
              className={`flex h-10 items-center justify-center gap-2 rounded-md text-sm font-black ${
                identity === "email"
                  ? "bg-white text-[#3a2400] shadow-sm"
                  : "text-[#6f5724]"
              }`}
              onClick={() => setIdentity("email")}
              type="button"
            >
              <Mail className="size-4" aria-hidden />
              {t("useEmail")}
            </button>
            <button
              className={`flex h-10 items-center justify-center gap-2 rounded-md text-sm font-black ${
                identity === "phone"
                  ? "bg-white text-[#3a2400] shadow-sm"
                  : "text-[#6f5724]"
              }`}
              onClick={() => setIdentity("phone")}
              type="button"
            >
              <Phone className="size-4" aria-hidden />
              {t("usePhone")}
            </button>
          </div>

          {identity === "email" ? (
            <input
              autoComplete="email"
              className="h-11 w-full rounded-lg border border-[#ead9a2] bg-[#fffdf5] px-3 text-sm font-semibold outline-none focus:border-[#ffbc0d] focus:ring-4 focus:ring-[#ffbc0d]/25"
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("email")}
              type="email"
              value={email}
            />
          ) : (
            <input
              autoComplete="tel"
              className="h-11 w-full rounded-lg border border-[#ead9a2] bg-[#fffdf5] px-3 text-sm font-semibold outline-none focus:border-[#ffbc0d] focus:ring-4 focus:ring-[#ffbc0d]/25"
              onChange={(event) => setPhone(event.target.value)}
              placeholder={t("phone")}
              type="tel"
              value={phone}
            />
          )}

          <div className="relative">
            <input
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              className="h-11 w-full rounded-lg border border-[#ead9a2] bg-[#fffdf5] px-3 pr-24 text-sm font-semibold outline-none focus:border-[#ffbc0d] focus:ring-4 focus:ring-[#ffbc0d]/25"
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t("password")}
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              className="absolute right-2 top-1/2 flex h-8 -translate-y-1/2 items-center gap-1 rounded-md px-2 text-xs font-black text-[#7a5a15]"
              onClick={() => setShowPassword((value) => !value)}
              type="button"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
              {showPassword ? t("hidePassword") : t("showPassword")}
            </button>
          </div>

          {mode === "register" ? (
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                autoComplete="one-time-code"
                className="h-11 rounded-lg border border-[#ead9a2] bg-[#fffdf5] px-3 text-sm font-semibold outline-none focus:border-[#ffbc0d] focus:ring-4 focus:ring-[#ffbc0d]/25"
                onChange={(event) => setCode(event.target.value)}
                placeholder={t("verificationCode")}
                value={code}
              />
              <button
                className="h-11 rounded-lg border border-[#ead9a2] bg-white px-4 text-sm font-black text-[#3a2400]"
                type="button"
              >
                {t("sendCode")}
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <label className="flex items-center gap-2 font-bold text-[#7a5a15]">
            <input
              className="size-4 accent-[#ffbc0d]"
              defaultChecked
              type="checkbox"
            />
            {t("rememberMe")}
          </label>
          {mode === "login" ? (
            <button className="font-black text-[#0e7490]" type="button">
              {t("forgotPassword")}
            </button>
          ) : null}
        </div>

        <p className="mt-3 text-xs font-semibold leading-5 text-[#7a5a15]">
          {mode === "register" ? t("passwordHelp") : t("authDemo")}
        </p>
        {mode === "register" ? (
          <p className="mt-1 text-xs font-semibold leading-5 text-[#7a5a15]">
            {t("terms")}
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 rounded-lg bg-[#fff1f1] px-3 py-2 text-sm font-black text-[#b91c1c]">
            {error}
          </p>
        ) : null}

        <button
          className="mt-5 h-12 w-full rounded-lg bg-[#ffbc0d] text-sm font-black text-[#3a2400] shadow-sm shadow-[#ffbc0d]/30"
          type="submit"
        >
          {mode === "login" ? t("login") : t("createAccount")}
        </button>

        <button
          className="mt-3 w-full text-sm font-black text-[#0e7490]"
          onClick={() => onMode(mode === "login" ? "register" : "login")}
          type="button"
        >
          {mode === "login" ? t("register") : t("login")}
        </button>
      </form>
    </Modal>
  );
}

function AuthRoleButton({
  active,
  description,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  description: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-lg border p-3 text-left transition ${
        active
          ? "border-[#ffbc0d] bg-[#fff2bf] text-[#3a2400]"
          : "border-[#ead9a2] bg-white text-[#3a2400]"
      }`}
      onClick={onClick}
      type="button"
    >
      <span className="flex items-center gap-2 text-sm font-black">
        {icon}
        {label}
      </span>
      <span className="mt-1 block text-xs font-semibold leading-5 text-[#7a5a15]">
        {description}
      </span>
    </button>
  );
}

function ChoiceButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex h-11 items-center gap-2 rounded-lg border px-3 text-left text-sm font-black transition ${
        active
          ? "border-[#ffbc0d] bg-[#ffbc0d] text-[#3a2400]"
          : "border-[#ead9a2] bg-white text-[#3a2400]"
      }`}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#3a2400]/45 p-3">
      <button
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
        aria-label="Close dialog backdrop"
      />
      <div className="relative w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-[#fffdf5] px-3 py-2">
      <dt className="font-bold text-[#7a5a15]">{label}</dt>
      <dd className="text-right font-black">{value}</dd>
    </div>
  );
}

function TrustBadge({
  t,
  trust,
}: {
  t: ReturnType<typeof useTranslations<"app">>;
  trust: Product["trustLevel"];
}) {
  const Icon = trust === "verified" ? BadgeCheck : ShieldCheck;

  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#e8f7f2] px-2 py-1 text-xs font-black text-[#0f766e]">
      <Icon className="size-3.5" aria-hidden />
      {t(trust)}
    </span>
  );
}

function filterProducts(
  products: Product[],
  query: string,
  locale: Locale,
  group: ProductGroup
) {
  const needle = query.trim().toLowerCase();

  return products.filter((product) => {
    const matchesGroup =
      group === "all" ? true : getProductGroup(product) === group;
    const searchable = [
      text(product.name, locale),
      product.category,
      product.condition,
      product.brand ?? "",
      product.size ?? "",
      product.color ?? "",
      product.sellerName,
      product.source,
      ...(product.tags ?? []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(needle);

    return matchesGroup && (!needle || searchable);
  });
}

function getProductGroup(product: Product): Exclude<ProductGroup, "all"> {
  if (product.category === "clothing" || product.category === "shoes") {
    return "clothing";
  }

  if (product.category === "appliance") {
    return "kitchen";
  }

  if (product.category === "home" || product.category === "furniture") {
    return "room";
  }

  if (product.category === "accessory") {
    return "accessories";
  }

  return "tech";
}

function productGroupLabelKey(group: ProductGroup) {
  const keys: Record<ProductGroup, string> = {
    all: "productGroupAll",
    tech: "productGroupTech",
    clothing: "productGroupClothing",
    kitchen: "productGroupKitchen",
    room: "productGroupRoom",
    accessories: "productGroupAccessories",
  };

  return keys[group];
}

function getProductGroupIcon(group: ProductGroup) {
  const icons: Record<ProductGroup, typeof PackageSearch> = {
    all: PackageSearch,
    tech: Laptop,
    clothing: Shirt,
    kitchen: CookingPot,
    room: Home,
    accessories: ShoppingBag,
  };

  return icons[group];
}

function filterRestaurants(
  restaurants: Restaurant[],
  query: string,
  locale: Locale
) {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return restaurants;
  }

  return restaurants.filter((restaurant) =>
    [
      text(restaurant.name, locale),
      text(restaurant.address, locale),
      restaurant.cuisine,
      restaurant.priceBand,
      ...restaurant.menuHighlights.map((item) => text(item, locale)),
    ]
      .join(" ")
      .toLowerCase()
      .includes(needle)
  );
}

function filterGuides(guides: Guide[], query: string, locale: Locale) {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return guides;
  }

  return guides.filter((guide) =>
    [text(guide.title, locale), text(guide.summary, locale), guide.category]
      .join(" ")
      .toLowerCase()
      .includes(needle)
  );
}

function formatKrw(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}
