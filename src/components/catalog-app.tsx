"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  ChevronDown,
  CookingPot,
  CreditCard,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Utensils,
  WalletCards,
  X,
} from "lucide-react";
import { text } from "@/lib/i18n";
import type { CatalogData, Locale, LocalizedText, Restaurant } from "@/lib/types";
import { locales } from "@/lib/types";

type CatalogAppProps = {
  initialData: CatalogData;
  locale: Locale;
};

type DeliveryMode = "delivery" | "pickup";
type PaymentMethod = "toss" | "bankTransfer" | "cashOnDelivery";

type CartItem = {
  id: string;
  restaurantId: string;
  name: LocalizedText;
  priceKrw: number;
  quantity: number;
};

type CustomerForm = {
  name: string;
  phone: string;
  address: string;
  note: string;
};

const cuisineLabels: Record<Restaurant["cuisine"], LocalizedText> = {
  korean: {
    uz: "Koreys taomi",
    ru: "Корейская кухня",
    en: "Korean food",
    ko: "한식",
  },
  halal: {
    uz: "Halol taom",
    ru: "Халяльная еда",
    en: "Halal food",
    ko: "할랄 음식",
  },
  "central-asian": {
    uz: "O‘zbek / SNG taomi",
    ru: "Узбекская / СНГ кухня",
    en: "Uzbek / CIS food",
    ko: "우즈베크 / CIS 음식",
  },
  cafe: {
    uz: "Kafe",
    ru: "Кафе",
    en: "Cafe",
    ko: "카페",
  },
  fast: {
    uz: "Fast food",
    ru: "Фастфуд",
    en: "Fast food",
    ko: "패스트푸드",
  },
};

const priceBandLabels: Record<Restaurant["priceBand"], string> = {
  budget: "₩",
  mid: "₩₩",
  premium: "₩₩₩",
};

const paymentLabels: Record<PaymentMethod, LocalizedText> = {
  toss: {
    uz: "Toss / karta",
    ru: "Toss / карта",
    en: "Toss / card",
    ko: "토스 / 카드",
  },
  bankTransfer: {
    uz: "Bank o‘tkazma",
    ru: "Банковский перевод",
    en: "Bank transfer",
    ko: "계좌이체",
  },
  cashOnDelivery: {
    uz: "Yetkazilganda to‘lash",
    ru: "Оплата при получении",
    en: "Pay on delivery",
    ko: "배달 시 결제",
  },
};

const heroCopy: Record<Locale, { title: string; subtitle: string; search: string }> = {
  uz: {
    title: "Koreyadagi halol va o‘zbek restoranlari bir joyda",
    subtitle:
      "JUTSU birinchi bosqichda faqat restoran va halol ovqat buyurtma platformasi sifatida ishlaydi.",
    search: "Restoran yoki ovqat nomini qidiring",
  },
  ru: {
    title: "Халяльные и узбекские рестораны в Корее в одном месте",
    subtitle:
      "На первом этапе JUTSU работает только как платформа заказа еды из ресторанов.",
    search: "Поиск ресторана или блюда",
  },
  en: {
    title: "Halal and Uzbek restaurants in Korea, all in one place",
    subtitle:
      "For the first phase, JUTSU is focused only on restaurant discovery and food ordering.",
    search: "Search restaurant or food",
  },
  ko: {
    title: "한국의 할랄 및 우즈베크 식당을 한곳에서",
    subtitle: "첫 단계에서 JUTSU는 식당과 음식 주문에만 집중합니다.",
    search: "식당 또는 음식 검색",
  },
};

export function CatalogApp({ initialData, locale }: CatalogAppProps) {
  const router = useRouter();
  const [catalog, setCatalog] = useState(initialData);
  const [selectedCity, setSelectedCity] = useState(initialData.selectedCity);
  const [query, setQuery] = useState("");
  const [onlyHalal, setOnlyHalal] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(
    null
  );
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cashOnDelivery");
  const [customerForm, setCustomerForm] = useState<CustomerForm>({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  const selectedCityData =
    catalog.cities.find((city) => city.slug === selectedCity) ?? catalog.cities[0];

  const filteredRestaurants = useMemo(
    () => filterRestaurants(catalog.restaurants, query, locale, onlyHalal),
    [catalog.restaurants, locale, onlyHalal, query]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.priceKrw * item.quantity, 0),
    [cartItems]
  );

  const cartRestaurant = cartItems[0]
    ? catalog.restaurants.find((restaurant) => restaurant.id === cartItems[0].restaurantId)
    : null;

  async function changeCity(nextCity: string) {
    setSelectedCity(nextCity);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/catalog?lang=${locale}&city=${nextCity}`);

      if (response.ok) {
        const nextCatalog = (await response.json()) as CatalogData;
        setCatalog(nextCatalog);
        router.replace(`/${locale}?city=${nextCity}`, { scroll: false });
      }
    } finally {
      setIsLoading(false);
    }
  }

  function addToCart(restaurant: Restaurant, item: CartItem) {
    setCartItems((currentItems) => {
      const isDifferentRestaurant = currentItems.some(
        (currentItem) => currentItem.restaurantId !== restaurant.id
      );

      const baseItems = isDifferentRestaurant ? [] : currentItems;
      const existingItem = baseItems.find((currentItem) => currentItem.id === item.id);

      if (existingItem) {
        return baseItems.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, quantity: currentItem.quantity + 1 }
            : currentItem
        );
      }

      return [...baseItems, item];
    });
  }

  function updateQuantity(itemId: string, quantity: number) {
    setCartItems((currentItems) =>
      currentItems
        .map((item) => (item.id === itemId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  }

  function placeOrder() {
    setOrderPlaced(true);
    setShowCheckout(false);
    setCartItems([]);
  }

  const copy = heroCopy[locale];

  return (
    <main className="min-h-screen bg-[#fff8df] text-[#3a2400]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-[#ead9a2] bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Image alt="JUTSU" height={48} priority src="/jutsu-logo.svg" width={160} />
            <div className="hidden h-8 w-px bg-[#ead9a2] sm:block" />
            <p className="hidden text-sm font-semibold text-[#7a5a15] sm:block">
              Halal food ordering platform in Korea
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <span className="sr-only">Language</span>
              <select
                className="h-10 appearance-none rounded-xl border border-[#ead9a2] bg-[#fffdf5] pl-3 pr-9 text-sm font-bold outline-none transition focus:border-[#ffbc0d] focus:ring-4 focus:ring-[#ffbc0d]/25"
                onChange={(event) => router.replace(`/${event.target.value}?city=${selectedCity}`)}
                value={locale}
              >
                {locales.map((item) => (
                  <option key={item} value={item}>
                    {item.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#7a5a15]"
              />
            </label>
            <a
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[#ead9a2] bg-[#fffdf5] px-3 text-sm font-black text-[#3a2400]"
              href="/business/dashboard"
            >
              Restaurant admin
            </a>
          </div>
        </header>

        <section className="grid gap-4 rounded-3xl border border-[#ead9a2] bg-white p-5 shadow-sm lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fff2bf] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#7a5a15]">
              <ShieldCheck className="size-4" aria-hidden />
              Restaurant only MVP
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-[#7a5a15] sm:text-base">
              {copy.subtitle}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <HeroStat label="Restaurants" value={catalog.restaurants.length.toString()} />
              <HeroStat label="City" value={text(selectedCityData.name, locale)} />
              <HeroStat label="Focus" value="Halal food" />
            </div>
          </div>
          <div className="rounded-3xl bg-[#3a2400] p-5 text-white">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ffdc72]">
              Order flow
            </p>
            <ol className="mt-5 space-y-3 text-sm font-semibold text-[#fff1bd]">
              <li>1. Choose city and restaurant</li>
              <li>2. Open menu and add food</li>
              <li>3. Checkout with phone/address</li>
              <li>4. Restaurant receives the order in admin panel later</li>
            </ol>
          </div>
        </section>

        <section className="rounded-3xl border border-[#ead9a2] bg-white p-3 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[260px_1fr_auto] lg:items-center">
            <label className="relative">
              <span className="sr-only">City</span>
              <select
                className="h-12 w-full appearance-none rounded-2xl border border-[#ead9a2] bg-[#fffdf5] pl-3 pr-9 text-sm font-bold outline-none transition focus:border-[#ffbc0d] focus:ring-4 focus:ring-[#ffbc0d]/25"
                onChange={(event) => changeCity(event.target.value)}
                value={selectedCity}
              >
                {catalog.cities.map((city) => (
                  <option key={city.slug} value={city.slug}>
                    {text(city.name, locale)} - {text(city.province, locale)}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-[#7a5a15]"
              />
            </label>

            <label className="relative">
              <span className="sr-only">Search</span>
              <Search
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#7a5a15]"
              />
              <input
                className="h-12 w-full rounded-2xl border border-[#ead9a2] bg-[#fffdf5] pl-10 pr-4 text-base outline-none transition placeholder:text-[#92784a] focus:border-[#ffbc0d] focus:ring-4 focus:ring-[#ffbc0d]/25"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.search}
                type="search"
                value={query}
              />
            </label>

            <button
              className={`h-12 rounded-2xl px-4 text-sm font-black transition ${
                onlyHalal
                  ? "bg-[#ffbc0d] text-[#3a2400] shadow-sm shadow-[#ffbc0d]/30"
                  : "border border-[#ead9a2] bg-[#fffdf5] text-[#7a5a15]"
              }`}
              onClick={() => setOnlyHalal((value) => !value)}
              type="button"
            >
              {onlyHalal ? "Halal only ✓" : "All restaurants"}
            </button>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black">{text(selectedCityData.name, locale)}</h2>
            <p className="text-sm font-semibold text-[#7a5a15]">
              Restaurants and halal food ordering only
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-[#7a5a15]">
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
            <span>{filteredRestaurants.length} restaurants</span>
          </div>
        </div>

        {filteredRestaurants.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredRestaurants.map((restaurant, index) => (
              <RestaurantCard
                key={restaurant.id}
                locale={locale}
                onOpen={() => setSelectedRestaurant(restaurant)}
                priority={index === 0}
                restaurant={restaurant}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#e3c56a] bg-white p-8 text-center text-sm font-bold text-[#7a5a15]">
            No restaurants found in this city yet.
          </div>
        )}
      </div>

      {cartItems.length ? (
        <CartBar
          cartItems={cartItems}
          locale={locale}
          onCheckout={() => {
            setOrderPlaced(false);
            setShowCheckout(true);
          }}
          restaurantName={cartRestaurant ? text(cartRestaurant.name, locale) : "Restaurant"}
          total={cartTotal}
        />
      ) : null}

      {selectedRestaurant ? (
        <RestaurantModal
          cartItems={cartItems}
          locale={locale}
          onAddToCart={addToCart}
          onClose={() => setSelectedRestaurant(null)}
          onQuantity={updateQuantity}
          restaurant={selectedRestaurant}
        />
      ) : null}

      {showCheckout ? (
        <CheckoutModal
          cartItems={cartItems}
          customerForm={customerForm}
          deliveryMode={deliveryMode}
          locale={locale}
          onClose={() => setShowCheckout(false)}
          onCustomerForm={setCustomerForm}
          onDeliveryMode={setDeliveryMode}
          onPaymentMethod={setPaymentMethod}
          onPlaceOrder={placeOrder}
          paymentMethod={paymentMethod}
          restaurantName={cartRestaurant ? text(cartRestaurant.name, locale) : "Restaurant"}
          total={cartTotal}
        />
      ) : null}

      {orderPlaced ? (
        <OrderSuccessModal locale={locale} onClose={() => setOrderPlaced(false)} />
      ) : null}
    </main>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#ead9a2] bg-[#fffdf5] p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#b27b00]">
        {label}
      </p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

function RestaurantCard({
  locale,
  onOpen,
  priority,
  restaurant,
}: {
  locale: Locale;
  onOpen: () => void;
  priority: boolean;
  restaurant: Restaurant;
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-[#ead9a2] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <button className="block w-full text-left" onClick={onOpen} type="button">
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
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-xl bg-[#ffbc0d] px-2 py-1 text-xs font-black text-[#3a2400]">
              <ShieldCheck className="size-3" aria-hidden />
              Halal
            </span>
          ) : null}
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-xl bg-white px-2 py-1 text-xs font-black text-[#9a4d00]">
            <Star className="size-3 fill-current" aria-hidden />
            {restaurant.rating.toFixed(1)}
          </span>
        </div>
        <div className="flex min-h-56 flex-col gap-3 p-4">
          <div>
            <h2 className="line-clamp-2 text-xl font-black">
              {text(restaurant.name, locale)}
            </h2>
            <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-[#7a5a15]">
              <MapPin className="size-4 shrink-0 text-[#d62828]" aria-hidden />
              <span className="truncate">{text(restaurant.address, locale)}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-xl bg-[#fff2bf] px-2 py-1 text-xs font-black text-[#3a2400]">
              {text(cuisineLabels[restaurant.cuisine], locale)}
            </span>
            <span className="rounded-xl bg-[#e7f7fb] px-2 py-1 text-xs font-black text-[#0e7490]">
              {priceBandLabels[restaurant.priceBand]}
            </span>
          </div>
          <ul className="space-y-1 text-sm font-semibold text-[#5b3b07]">
            {restaurant.menuHighlights.slice(0, 3).map((item) => (
              <li key={text(item, locale)}>• {text(item, locale)}</li>
            ))}
          </ul>
          <span className="mt-auto inline-flex h-11 items-center justify-center rounded-2xl bg-[#ffbc0d] text-sm font-black text-[#3a2400] shadow-sm shadow-[#ffbc0d]/30">
            Open menu
          </span>
        </div>
      </button>
    </article>
  );
}

function RestaurantModal({
  cartItems,
  locale,
  onAddToCart,
  onClose,
  onQuantity,
  restaurant,
}: {
  cartItems: CartItem[];
  locale: Locale;
  onAddToCart: (restaurant: Restaurant, item: CartItem) => void;
  onClose: () => void;
  onQuantity: (itemId: string, quantity: number) => void;
  restaurant: Restaurant;
}) {
  const menuItems = buildMenuItems(restaurant);

  return (
    <div className="fixed inset-0 z-50 bg-[#3a2400]/70 p-4 backdrop-blur-sm">
      <div className="mx-auto flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="relative h-56 shrink-0 bg-[#fff2bf] sm:h-72">
          <Image
            alt={text(restaurant.name, locale)}
            className="object-cover"
            fill
            sizes="100vw"
            src={restaurant.imageUrl}
          />
          <button
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white text-[#3a2400] shadow-sm"
            onClick={onClose}
            type="button"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-3xl font-black">{text(restaurant.name, locale)}</h2>
              <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-[#7a5a15]">
                <MapPin className="size-4 text-[#d62828]" aria-hidden />
                {text(restaurant.address, locale)}
              </p>
            </div>
            <a
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#ead9a2] px-4 text-sm font-black text-[#3a2400]"
              href={`tel:${restaurant.contact}`}
            >
              <Phone className="size-4" aria-hidden />
              Contact
            </a>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {menuItems.map((item) => {
              const inCart = cartItems.find((cartItem) => cartItem.id === item.id);

              return (
                <article
                  className="rounded-3xl border border-[#ead9a2] bg-[#fffdf5] p-4"
                  key={item.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-black">{text(item.name, locale)}</p>
                      <p className="mt-1 text-sm font-semibold text-[#7a5a15]">
                        {text(item.description, locale)}
                      </p>
                    </div>
                    <p className="shrink-0 text-lg font-black">
                      {formatKrw(item.priceKrw)}
                    </p>
                  </div>
                  {inCart ? (
                    <div className="mt-4 flex items-center justify-between rounded-2xl bg-white p-2">
                      <button
                        className="size-9 rounded-xl border border-[#ead9a2] font-black"
                        onClick={() => onQuantity(item.id, inCart.quantity - 1)}
                        type="button"
                      >
                        −
                      </button>
                      <span className="text-sm font-black">{inCart.quantity}</span>
                      <button
                        className="size-9 rounded-xl bg-[#ffbc0d] font-black text-[#3a2400]"
                        onClick={() => onQuantity(item.id, inCart.quantity + 1)}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      className="mt-4 h-11 w-full rounded-2xl bg-[#ffbc0d] text-sm font-black text-[#3a2400] shadow-sm shadow-[#ffbc0d]/30"
                      onClick={() => onAddToCart(restaurant, item)}
                      type="button"
                    >
                      Add to cart
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CartBar({
  cartItems,
  locale,
  onCheckout,
  restaurantName,
  total,
}: {
  cartItems: CartItem[];
  locale: Locale;
  onCheckout: () => void;
  restaurantName: string;
  total: number;
}) {
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ead9a2] bg-white/95 p-3 shadow-2xl backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[#ffbc0d] text-[#3a2400]">
            <ShoppingBag className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-black">{restaurantName}</p>
            <p className="text-xs font-semibold text-[#7a5a15]">
              {itemCount} item · {formatKrw(total)} · {locale.toUpperCase()}
            </p>
          </div>
        </div>
        <button
          className="h-12 rounded-2xl bg-[#3a2400] px-6 text-sm font-black text-white"
          onClick={onCheckout}
          type="button"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}

function CheckoutModal({
  cartItems,
  customerForm,
  deliveryMode,
  locale,
  onClose,
  onCustomerForm,
  onDeliveryMode,
  onPaymentMethod,
  onPlaceOrder,
  paymentMethod,
  restaurantName,
  total,
}: {
  cartItems: CartItem[];
  customerForm: CustomerForm;
  deliveryMode: DeliveryMode;
  locale: Locale;
  onClose: () => void;
  onCustomerForm: (form: CustomerForm) => void;
  onDeliveryMode: (mode: DeliveryMode) => void;
  onPaymentMethod: (method: PaymentMethod) => void;
  onPlaceOrder: () => void;
  paymentMethod: PaymentMethod;
  restaurantName: string;
  total: number;
}) {
  const canPlaceOrder = customerForm.name.trim() && customerForm.phone.trim();

  return (
    <div className="fixed inset-0 z-50 bg-[#3a2400]/70 p-4 backdrop-blur-sm">
      <div className="mx-auto max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#b27b00]">
              Checkout
            </p>
            <h2 className="mt-2 text-3xl font-black">{restaurantName}</h2>
          </div>
          <button
            className="flex size-10 items-center justify-center rounded-full border border-[#ead9a2]"
            onClick={onClose}
            type="button"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {cartItems.map((item) => (
            <div
              className="flex items-center justify-between gap-3 rounded-2xl bg-[#fffdf5] p-3"
              key={item.id}
            >
              <div>
                <p className="font-black">{text(item.name, locale)}</p>
                <p className="text-sm font-semibold text-[#7a5a15]">
                  {item.quantity} × {formatKrw(item.priceKrw)}
                </p>
              </div>
              <p className="font-black">{formatKrw(item.priceKrw * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <ChoiceButton
            active={deliveryMode === "delivery"}
            icon={<CookingPot className="size-4" />}
            label="Delivery"
            onClick={() => onDeliveryMode("delivery")}
          />
          <ChoiceButton
            active={deliveryMode === "pickup"}
            icon={<ShoppingBag className="size-4" />}
            label="Pickup"
            onClick={() => onDeliveryMode("pickup")}
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <TextInput
            label="Name"
            onChange={(value) => onCustomerForm({ ...customerForm, name: value })}
            value={customerForm.name}
          />
          <TextInput
            label="Phone"
            onChange={(value) => onCustomerForm({ ...customerForm, phone: value })}
            value={customerForm.phone}
          />
          <TextInput
            label="Address"
            onChange={(value) => onCustomerForm({ ...customerForm, address: value })}
            value={customerForm.address}
          />
          <TextInput
            label="Order note"
            onChange={(value) => onCustomerForm({ ...customerForm, note: value })}
            value={customerForm.note}
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {(Object.keys(paymentLabels) as PaymentMethod[]).map((method) => (
            <ChoiceButton
              active={paymentMethod === method}
              icon={method === "toss" ? <CreditCard className="size-4" /> : <WalletCards className="size-4" />}
              key={method}
              label={text(paymentLabels[method], locale)}
              onClick={() => onPaymentMethod(method)}
            />
          ))}
        </div>

        <div className="mt-6 rounded-3xl bg-[#3a2400] p-5 text-white">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ffdc72]">
              Total
            </p>
            <p className="text-3xl font-black">{formatKrw(total)}</p>
          </div>
          <button
            className="mt-5 h-12 w-full rounded-2xl bg-[#ffbc0d] text-sm font-black text-[#3a2400] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canPlaceOrder}
            onClick={onPlaceOrder}
            type="button"
          >
            Place demo order
          </button>
          <p className="mt-3 text-xs font-semibold leading-5 text-[#fff1bd]">
            This is frontend-only. Later it should save order state in Django and
            send the order to the restaurant admin panel.
          </p>
        </div>
      </div>
    </div>
  );
}

function OrderSuccessModal({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const message: Record<Locale, string> = {
    uz: "Buyurtma qabul qilindi. Keyingi bosqichda bu order restoran admin paneliga tushadi.",
    ru: "Заказ принят. На следующем этапе он появится в панели ресторана.",
    en: "Order received. In the next phase it will appear in the restaurant admin panel.",
    ko: "주문이 접수되었습니다. 다음 단계에서 식당 관리자 패널에 표시됩니다.",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3a2400]/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#ffbc0d] text-[#3a2400]">
          <BadgeCheck className="size-8" aria-hidden />
        </div>
        <h2 className="mt-4 text-2xl font-black">Order placed</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#7a5a15]">
          {message[locale]}
        </p>
        <button
          className="mt-5 h-11 w-full rounded-2xl bg-[#3a2400] text-sm font-black text-white"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>
    </div>
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
      className={`flex h-12 items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-black transition ${
        active
          ? "border-[#ffbc0d] bg-[#ffbc0d] text-[#3a2400]"
          : "border-[#ead9a2] bg-[#fffdf5] text-[#7a5a15]"
      }`}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function TextInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-[#7a5a15]">
        {label}
      </span>
      <input
        className="mt-1 h-12 w-full rounded-2xl border border-[#ead9a2] bg-[#fffdf5] px-4 text-sm font-bold outline-none transition focus:border-[#ffbc0d] focus:ring-4 focus:ring-[#ffbc0d]/25"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function filterRestaurants(
  restaurants: Restaurant[],
  query: string,
  locale: Locale,
  onlyHalal: boolean
) {
  const normalizedQuery = query.trim().toLowerCase();

  return restaurants.filter((restaurant) => {
    if (onlyHalal && !restaurant.halalFriendly) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableText = [
      text(restaurant.name, locale),
      text(restaurant.address, locale),
      text(cuisineLabels[restaurant.cuisine], locale),
      ...restaurant.menuHighlights.map((item) => text(item, locale)),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

function buildMenuItems(restaurant: Restaurant): CartItem[] {
  const basePrice = restaurant.priceBand === "budget" ? 9000 : restaurant.priceBand === "mid" ? 13000 : 19000;

  return restaurant.menuHighlights.map((highlight, index) => ({
    id: `${restaurant.id}-menu-${index + 1}`,
    restaurantId: restaurant.id,
    name: highlight,
    description: {
      uz: "Restoran menyusidan demo ovqat. Keyinchalik real menyu Django API orqali keladi.",
      ru: "Демо блюдо из меню ресторана. Позже реальное меню будет приходить через Django API.",
      en: "Demo menu item. Later the real menu will come from the Django API.",
      ko: "데모 메뉴 항목입니다. 실제 메뉴는 나중에 Django API에서 가져옵니다.",
    },
    priceKrw: basePrice + index * 2500,
    quantity: 1,
  }));
}

function formatKrw(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    currency: "KRW",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}
