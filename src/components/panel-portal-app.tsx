"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ClipboardList,
  KeyRound,
  LockKeyhole,
  LogOut,
  Plus,
  Save,
  ShieldCheck,
  ShoppingBag,
  Store,
  UserPlus,
  Utensils,
} from "lucide-react";
import { text } from "@/lib/i18n";
import { CatalogData, Locale, locales, Product } from "@/lib/types";

type PortalMode = "partner" | "super";
type AccountType = "restaurant" | "seller";

type PanelAccount = {
  id: string;
  businessName: string;
  businessType: AccountType;
  citySlug: string;
  createdAt: string;
  ownerName: string;
  password: string;
  status: "active";
  username: string;
};

type MenuDraft = {
  available: boolean;
  category: string;
  halalFriendly: boolean;
  name: string;
  price: string;
};

type MenuItem = MenuDraft & {
  id: string;
  priceKrw: number;
};

type ListingDraft = {
  category: Product["category"];
  contact: string;
  price: string;
  stock: string;
  title: string;
};

type ListingItem = ListingDraft & {
  id: string;
  priceKrw: number;
};

type PanelPortalAppProps = {
  catalog: CatalogData;
  locale: Locale;
  mode: PortalMode;
};

const accountStorageKey = "jutsu-panel-accounts";
const superUsername = "super@jutsu.app";
const superPassword = "super2026";

const seedAccounts: PanelAccount[] = [
  {
    id: "seed-restaurant",
    businessName: "JUTSU Local Kitchen",
    businessType: "restaurant",
    citySlug: "incheon",
    createdAt: "2026-06-04",
    ownerName: "Restaurant owner",
    password: "jutsu2026",
    status: "active",
    username: "kitchen@jutsu.app",
  },
  {
    id: "seed-seller",
    businessName: "JUTSU Tech Seller",
    businessType: "seller",
    citySlug: "seoul",
    createdAt: "2026-06-04",
    ownerName: "Seller owner",
    password: "seller2026",
    status: "active",
    username: "seller@jutsu.app",
  },
];

export function PanelPortalApp({
  catalog,
  locale,
  mode,
}: PanelPortalAppProps) {
  const t = useTranslations("app");
  const router = useRouter();
  const [accounts, setAccounts] = useState<PanelAccount[]>(() =>
    typeof window === "undefined" ? seedAccounts : readAccounts()
  );
  const [activeAccount, setActiveAccount] = useState<PanelAccount | null>(null);
  const [partnerLogin, setPartnerLogin] = useState({
    password: "",
    username: "",
  });
  const [adminLogin, setAdminLogin] = useState({
    password: "",
    username: "",
  });
  const [adminReady, setAdminReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [createdAccount, setCreatedAccount] = useState<PanelAccount | null>(
    null
  );
  const [accountDraft, setAccountDraft] = useState({
    businessName: "New halal restaurant",
    businessType: "restaurant" as AccountType,
    citySlug: catalog.selectedCity,
    ownerName: "Owner name",
    password: "",
    username: "",
  });
  const [menuDraft, setMenuDraft] = useState<MenuDraft>({
    available: true,
    category: "Lunch",
    halalFriendly: true,
    name: "Chicken bibimbap",
    price: "9000",
  });
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [listingDraft, setListingDraft] = useState<ListingDraft>({
    category: "phone",
    contact: "010-0000-9000",
    price: "250000",
    stock: "3",
    title: "Galaxy starter phone",
  });
  const [listingItems, setListingItems] = useState<ListingItem[]>([]);

  const cityName = useMemo(() => {
    const city = catalog.cities.find(
      (item) => item.slug === (activeAccount?.citySlug ?? catalog.selectedCity)
    );
    return city ? text(city.name, locale) : catalog.selectedCity;
  }, [activeAccount?.citySlug, catalog.cities, catalog.selectedCity, locale]);

  const saveAccounts = (nextAccounts: PanelAccount[]) => {
    setAccounts(nextAccounts);
    try {
      localStorage.setItem(accountStorageKey, JSON.stringify(nextAccounts));
    } catch {
      setNotice(t("panelStorageNotice"));
    }
  };

  const signInPartner = () => {
    const nextAccount = accounts.find(
      (account) =>
        account.username.toLowerCase() ===
          partnerLogin.username.trim().toLowerCase() &&
        account.password === partnerLogin.password.trim()
    );

    if (!nextAccount) {
      setNotice(t("panelWrongCredentials"));
      return;
    }

    setNotice("");
    setActiveAccount(nextAccount);
  };

  const signInAdmin = () => {
    if (
      adminLogin.username.trim().toLowerCase() !== superUsername ||
      adminLogin.password.trim() !== superPassword
    ) {
      setNotice(t("panelWrongCredentials"));
      return;
    }

    setNotice("");
    setAdminReady(true);
  };

  const createPanelAccount = () => {
    const businessName = accountDraft.businessName.trim() || "JUTSU Partner";
    const username =
      accountDraft.username.trim() || `${slugify(businessName)}@jutsu.app`;
    const password = accountDraft.password.trim() || generatePassword();

    if (
      accounts.some(
        (account) => account.username.toLowerCase() === username.toLowerCase()
      )
    ) {
      setNotice(t("panelAccountExists"));
      return;
    }

    const nextAccount: PanelAccount = {
      id: `panel-account-${Date.now()}`,
      businessName,
      businessType: accountDraft.businessType,
      citySlug: accountDraft.citySlug,
      createdAt: new Date().toISOString().slice(0, 10),
      ownerName: accountDraft.ownerName.trim() || "Owner",
      password,
      status: "active",
      username,
    };
    const nextAccounts = [nextAccount, ...accounts];

    saveAccounts(nextAccounts);
    setCreatedAccount(nextAccount);
    setNotice(t("panelAccountCreated"));
    setAccountDraft((current) => ({
      ...current,
      businessName: "",
      ownerName: "",
      password: "",
      username: "",
    }));
  };

  const addMenuItem = () => {
    const name = menuDraft.name.trim() || "Menu item";
    const nextItem: MenuItem = {
      ...menuDraft,
      id: `menu-${Date.now()}`,
      name,
      priceKrw: Math.max(1000, Number(menuDraft.price) || 0),
    };

    setMenuItems((current) => [nextItem, ...current]);
    setNotice(t("panelMenuAdded"));
  };

  const addListingItem = () => {
    const title = listingDraft.title.trim() || "Panel listing";
    const nextItem: ListingItem = {
      ...listingDraft,
      id: `listing-${Date.now()}`,
      priceKrw: Math.max(1000, Number(listingDraft.price) || 0),
      title,
    };

    setListingItems((current) => [nextItem, ...current]);
    setNotice(t("panelProductAdded"));
  };

  return (
    <main className="min-h-screen bg-[#fff8df] text-[#3a2400]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-lg border border-[#ead9a2] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Image alt="JUTSU" height={44} src="/jutsu-logo.svg" width={148} />
            <div>
              <p className="text-xs font-black uppercase text-[#7a5a15]">
                {mode === "super" ? t("superPanel") : t("panel")}
              </p>
              <h1 className="text-xl font-black">
                {mode === "super"
                  ? t("superPanelTitle")
                  : t("panelSeparateTitle")}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <span className="sr-only">{t("language")}</span>
              <select
                className="h-10 appearance-none rounded-lg border border-[#ead9a2] bg-[#fffdf5] pl-3 pr-9 text-sm font-bold outline-none transition focus:border-[#ffbc0d] focus:ring-4 focus:ring-[#ffbc0d]/25"
                onChange={(event) =>
                  router.replace(
                    `/${event.target.value}/${mode === "super" ? "super-panel" : "panel"}`
                  )
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
            <button
              className="flex h-10 items-center gap-2 rounded-lg border border-[#ead9a2] bg-white px-3 text-sm font-black text-[#3a2400]"
              onClick={() => router.push(`/${locale}`)}
              type="button"
            >
              <ArrowLeft className="size-4" aria-hidden />
              {t("panelBackToSite")}
            </button>
          </div>
        </header>

        {notice ? (
          <div className="flex items-center gap-2 rounded-lg border border-[#bfe7d6] bg-[#effaf5] px-4 py-3 text-sm font-black text-[#0f766e]">
            <Check className="size-4" aria-hidden />
            {notice}
          </div>
        ) : null}

        {mode === "partner" ? (
          activeAccount ? (
            <PartnerDashboard
              account={activeAccount}
              cityName={cityName}
              listingDraft={listingDraft}
              listingItems={listingItems}
              menuDraft={menuDraft}
              menuItems={menuItems}
              onAddListing={addListingItem}
              onAddMenu={addMenuItem}
              onListingDraft={setListingDraft}
              onLogout={() => {
                setActiveAccount(null);
                setNotice("");
              }}
              onMenuDraft={setMenuDraft}
              t={t}
            />
          ) : (
            <PartnerLogin
              onLogin={signInPartner}
              onUpdate={setPartnerLogin}
              t={t}
              value={partnerLogin}
            />
          )
        ) : adminReady ? (
          <SuperPanel
            accounts={accounts}
            accountDraft={accountDraft}
            catalog={catalog}
            createdAccount={createdAccount}
            locale={locale}
            onCreate={createPanelAccount}
            onDraft={setAccountDraft}
            onLogout={() => {
              setAdminReady(false);
              setCreatedAccount(null);
              setNotice("");
            }}
            t={t}
          />
        ) : (
          <AdminLogin
            onLogin={signInAdmin}
            onUpdate={setAdminLogin}
            t={t}
            value={adminLogin}
          />
        )}
      </div>
    </main>
  );
}

function PartnerLogin({
  onLogin,
  onUpdate,
  t,
  value,
}: {
  onLogin: () => void;
  onUpdate: React.Dispatch<
    React.SetStateAction<{ password: string; username: string }>
  >;
  t: ReturnType<typeof useTranslations<"app">>;
  value: { password: string; username: string };
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_420px] lg:items-start">
      <section className="rounded-lg border border-[#ead9a2] bg-white p-5 shadow-sm">
        <div className="flex size-12 items-center justify-center rounded-lg bg-[#ffbc0d] text-[#3a2400]">
          <Store className="size-6" aria-hidden />
        </div>
        <h2 className="mt-4 text-3xl font-black">
          {t("panelSeparateTitle")}
        </h2>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#7a5a15]">
          {t("panelSeparateSubtitle")}
        </p>
        <div className="mt-5 rounded-lg border border-[#ead9a2] bg-[#fffdf5] p-4 text-sm font-bold leading-6 text-[#5b3b07]">
          {t("panelContactNotice")}
        </div>
      </section>

      <section className="rounded-lg border border-[#ead9a2] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <LockKeyhole className="size-5 text-[#0e7490]" aria-hidden />
          <h2 className="text-xl font-black">{t("panelLoginTitle")}</h2>
        </div>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#7a5a15]">
          {t("panelLoginSubtitle")}
        </p>
        <div className="mt-4 space-y-3">
          <PortalInput
            label={t("panelUsername")}
            onChange={(username) =>
              onUpdate((current) => ({ ...current, username }))
            }
            value={value.username}
          />
          <PortalInput
            label={t("panelPassword")}
            onChange={(password) =>
              onUpdate((current) => ({ ...current, password }))
            }
            type="password"
            value={value.password}
          />
          <button
            className="h-11 w-full rounded-lg bg-[#ffbc0d] text-sm font-black text-[#3a2400] shadow-sm shadow-[#ffbc0d]/30"
            onClick={onLogin}
            type="button"
          >
            {t("panelSignin")}
          </button>
          <p className="text-xs font-semibold leading-5 text-[#7a5a15]">
            {t("panelDemoCredentials")}
          </p>
        </div>
      </section>
    </div>
  );
}

function AdminLogin({
  onLogin,
  onUpdate,
  t,
  value,
}: {
  onLogin: () => void;
  onUpdate: React.Dispatch<
    React.SetStateAction<{ password: string; username: string }>
  >;
  t: ReturnType<typeof useTranslations<"app">>;
  value: { password: string; username: string };
}) {
  return (
    <section className="mx-auto w-full max-w-md rounded-lg border border-[#ead9a2] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-5 text-[#0e7490]" aria-hidden />
        <h2 className="text-xl font-black">{t("superAdminLogin")}</h2>
      </div>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#7a5a15]">
        {t("superPanelSubtitle")}
      </p>
      <div className="mt-4 space-y-3">
        <PortalInput
          label={t("panelUsername")}
          onChange={(username) =>
            onUpdate((current) => ({ ...current, username }))
          }
          value={value.username}
        />
        <PortalInput
          label={t("panelPassword")}
          onChange={(password) =>
            onUpdate((current) => ({ ...current, password }))
          }
          type="password"
          value={value.password}
        />
        <button
          className="h-11 w-full rounded-lg bg-[#3a2400] text-sm font-black text-white"
          onClick={onLogin}
          type="button"
        >
          {t("panelSignin")}
        </button>
        <p className="text-xs font-semibold leading-5 text-[#7a5a15]">
          {t("adminDemoCredentials")}
        </p>
      </div>
    </section>
  );
}

function PartnerDashboard({
  account,
  cityName,
  listingDraft,
  listingItems,
  menuDraft,
  menuItems,
  onAddListing,
  onAddMenu,
  onListingDraft,
  onLogout,
  onMenuDraft,
  t,
}: {
  account: PanelAccount;
  cityName: string;
  listingDraft: ListingDraft;
  listingItems: ListingItem[];
  menuDraft: MenuDraft;
  menuItems: MenuItem[];
  onAddListing: () => void;
  onAddMenu: () => void;
  onListingDraft: React.Dispatch<React.SetStateAction<ListingDraft>>;
  onLogout: () => void;
  onMenuDraft: React.Dispatch<React.SetStateAction<MenuDraft>>;
  t: ReturnType<typeof useTranslations<"app">>;
}) {
  const isRestaurant = account.businessType === "restaurant";

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-4 rounded-lg border border-[#ead9a2] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-[#7a5a15]">
            {t("panelDashboard")}
          </p>
          <h2 className="mt-1 text-2xl font-black">{account.businessName}</h2>
          <p className="mt-2 text-sm font-semibold text-[#7a5a15]">
            {cityName} · {account.username}
          </p>
        </div>
        <button
          className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#ead9a2] bg-white px-3 text-sm font-black text-[#3a2400]"
          onClick={onLogout}
          type="button"
        >
          <LogOut className="size-4" aria-hidden />
          {t("panelLogout")}
        </button>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        <PortalMetric icon={<Store />} label={t("businessName")} value={account.businessName} />
        <PortalMetric
          icon={<KeyRound />}
          label={t("businessType")}
          value={
            isRestaurant ? t("businessRestaurant") : t("businessSeller")
          }
        />
        <PortalMetric icon={<ClipboardList />} label={t("status")} value={t("active")} />
      </div>

      {isRestaurant ? (
        <PortalCard
          icon={<Utensils className="size-5" />}
          subtitle={t("restaurantWorkspaceSubtitle")}
          title={t("restaurantWorkspace")}
        >
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <PortalInput
              label={t("menuItemName")}
              onChange={(name) =>
                onMenuDraft((current) => ({ ...current, name }))
              }
              value={menuDraft.name}
            />
            <PortalInput
              label={t("menuCategory")}
              onChange={(category) =>
                onMenuDraft((current) => ({ ...current, category }))
              }
              value={menuDraft.category}
            />
            <PortalInput
              inputMode="numeric"
              label={t("priceKrw")}
              onChange={(price) =>
                onMenuDraft((current) => ({ ...current, price }))
              }
              value={menuDraft.price}
            />
            <div className="flex flex-col justify-end gap-2">
              <PortalCheckbox
                checked={menuDraft.halalFriendly}
                label={t("halalFriendly")}
                onChange={(halalFriendly) =>
                  onMenuDraft((current) => ({ ...current, halalFriendly }))
                }
              />
              <PortalCheckbox
                checked={menuDraft.available}
                label={t("available")}
                onChange={(available) =>
                  onMenuDraft((current) => ({ ...current, available }))
                }
              />
            </div>
          </div>
          <button
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#ffbc0d] text-sm font-black text-[#3a2400]"
            onClick={onAddMenu}
            type="button"
          >
            <Plus className="size-4" aria-hidden />
            {t("addMenuItem")}
          </button>
          <PortalList
            empty={t("menuEmpty")}
            rows={menuItems.map((item) => ({
              id: item.id,
              meta: `${formatKrw(item.priceKrw)} · ${
                item.available ? t("available") : t("unavailable")
              }`,
              title: `${item.name} · ${item.category}`,
            }))}
          />
        </PortalCard>
      ) : (
        <PortalCard
          icon={<ShoppingBag className="size-5" />}
          subtitle={t("sellerWorkspaceSubtitle")}
          title={t("sellerWorkspace")}
        >
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <PortalInput
              label={t("productTitle")}
              onChange={(title) =>
                onListingDraft((current) => ({ ...current, title }))
              }
              value={listingDraft.title}
            />
            <PortalSelect
              label={t("category")}
              onChange={(category) =>
                onListingDraft((current) => ({
                  ...current,
                  category: category as Product["category"],
                }))
              }
              options={[
                ["phone", t("techPhone")],
                ["laptop", t("techLaptop")],
                ["appliance", t("techKitchen")],
                ["clothing", t("productGroupClothing")],
                ["accessory", t("techAccessory")],
              ]}
              value={listingDraft.category}
            />
            <PortalInput
              inputMode="numeric"
              label={t("priceKrw")}
              onChange={(price) =>
                onListingDraft((current) => ({ ...current, price }))
              }
              value={listingDraft.price}
            />
            <PortalInput
              inputMode="numeric"
              label={t("stock")}
              onChange={(stock) =>
                onListingDraft((current) => ({ ...current, stock }))
              }
              value={listingDraft.stock}
            />
            <PortalInput
              label={t("contact")}
              onChange={(contact) =>
                onListingDraft((current) => ({ ...current, contact }))
              }
              value={listingDraft.contact}
            />
          </div>
          <button
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#ffbc0d] text-sm font-black text-[#3a2400]"
            onClick={onAddListing}
            type="button"
          >
            <Plus className="size-4" aria-hidden />
            {t("addTechProduct")}
          </button>
          <PortalList
            empty={t("empty")}
            rows={listingItems.map((item) => ({
              id: item.id,
              meta: `${formatKrw(item.priceKrw)} · ${item.stock} ${t("inStock")}`,
              title: item.title,
            }))}
          />
        </PortalCard>
      )}
    </div>
  );
}

function SuperPanel({
  accounts,
  accountDraft,
  catalog,
  createdAccount,
  locale,
  onCreate,
  onDraft,
  onLogout,
  t,
}: {
  accounts: PanelAccount[];
  accountDraft: {
    businessName: string;
    businessType: AccountType;
    citySlug: string;
    ownerName: string;
    password: string;
    username: string;
  };
  catalog: CatalogData;
  createdAccount: PanelAccount | null;
  locale: Locale;
  onCreate: () => void;
  onDraft: React.Dispatch<React.SetStateAction<{
    businessName: string;
    businessType: AccountType;
    citySlug: string;
    ownerName: string;
    password: string;
    username: string;
  }>>;
  onLogout: () => void;
  t: ReturnType<typeof useTranslations<"app">>;
}) {
  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-4 rounded-lg border border-[#ead9a2] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-[#7a5a15]">
            {t("superPanel")}
          </p>
          <h2 className="mt-1 text-2xl font-black">{t("createPanelLogin")}</h2>
          <p className="mt-2 text-sm font-semibold text-[#7a5a15]">
            {t("panelRouteHint")}
          </p>
        </div>
        <button
          className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#ead9a2] bg-white px-3 text-sm font-black text-[#3a2400]"
          onClick={onLogout}
          type="button"
        >
          <LogOut className="size-4" aria-hidden />
          {t("panelLogout")}
        </button>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <PortalCard
          icon={<UserPlus className="size-5" />}
          subtitle={t("superPanelSubtitle")}
          title={t("createPanelAccount")}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <PortalInput
              label={t("businessName")}
              onChange={(businessName) =>
                onDraft((current) => ({ ...current, businessName }))
              }
              value={accountDraft.businessName}
            />
            <PortalInput
              label={t("ownerName")}
              onChange={(ownerName) =>
                onDraft((current) => ({ ...current, ownerName }))
              }
              value={accountDraft.ownerName}
            />
            <PortalSelect
              label={t("businessType")}
              onChange={(businessType) =>
                onDraft((current) => ({
                  ...current,
                  businessType: businessType as AccountType,
                }))
              }
              options={[
                ["restaurant", t("businessRestaurant")],
                ["seller", t("businessSeller")],
              ]}
              value={accountDraft.businessType}
            />
            <PortalSelect
              label={t("city")}
              onChange={(citySlug) =>
                onDraft((current) => ({ ...current, citySlug }))
              }
              options={catalog.cities.map((city) => [
                city.slug,
                text(city.name, locale),
              ])}
              value={accountDraft.citySlug}
            />
            <PortalInput
              label={t("panelUsername")}
              onChange={(username) =>
                onDraft((current) => ({ ...current, username }))
              }
              value={accountDraft.username}
            />
            <PortalInput
              label={t("panelPassword")}
              onChange={(password) =>
                onDraft((current) => ({ ...current, password }))
              }
              value={accountDraft.password}
            />
          </div>
          <button
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#ffbc0d] text-sm font-black text-[#3a2400]"
            onClick={onCreate}
            type="button"
          >
            <Save className="size-4" aria-hidden />
            {t("createPanelLogin")}
          </button>
        </PortalCard>

        <PortalCard
          icon={<KeyRound className="size-5" />}
          subtitle={t("generatedLogin")}
          title={t("panelAccounts")}
        >
          {createdAccount ? (
            <div className="rounded-lg border border-[#bfe7d6] bg-[#effaf5] p-3 text-sm font-bold leading-6 text-[#0f766e]">
              <p>{createdAccount.businessName}</p>
              <p>{createdAccount.username}</p>
              <p>{createdAccount.password}</p>
            </div>
          ) : (
            <p className="text-sm font-semibold leading-6 text-[#7a5a15]">
              {t("generatedLogin")}
            </p>
          )}
        </PortalCard>
      </div>

      <PortalCard
        icon={<ClipboardList className="size-5" />}
        subtitle={t("panelRouteHint")}
        title={t("panelAccounts")}
      >
        <div className="overflow-hidden rounded-lg border border-[#ead9a2]">
          {accounts.map((account) => (
            <div
              className="grid gap-2 border-b border-[#ead9a2] bg-white p-3 text-sm font-semibold last:border-b-0 md:grid-cols-[1fr_1fr_1fr_auto]"
              key={account.id}
            >
              <span className="font-black">{account.businessName}</span>
              <span>{account.username}</span>
              <span>{account.password}</span>
              <span className="text-[#0f766e]">{t("active")}</span>
            </div>
          ))}
        </div>
      </PortalCard>
    </div>
  );
}

function PortalCard({
  children,
  icon,
  subtitle,
  title,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-[#ead9a2] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-[#fff2bf] text-[#3a2400]">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-black">{title}</h3>
          <p className="mt-1 text-sm font-semibold leading-5 text-[#7a5a15]">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function PortalInput({
  inputMode,
  label,
  onChange,
  type = "text",
  value,
}: {
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-[#7a5a15]">
        {label}
      </span>
      <input
        className="mt-1 h-11 w-full rounded-lg border border-[#ead9a2] bg-[#fffdf5] px-3 text-sm font-semibold outline-none focus:border-[#ffbc0d] focus:ring-4 focus:ring-[#ffbc0d]/25"
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  );
}

function PortalSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: [string, string][];
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-[#7a5a15]">
        {label}
      </span>
      <select
        className="mt-1 h-11 w-full rounded-lg border border-[#ead9a2] bg-[#fffdf5] px-3 text-sm font-semibold outline-none focus:border-[#ffbc0d] focus:ring-4 focus:ring-[#ffbc0d]/25"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function PortalCheckbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-bold text-[#7a5a15]">
      <input
        checked={checked}
        className="size-4 accent-[#ffbc0d]"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      {label}
    </label>
  );
}

function PortalMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[#ead9a2] bg-white p-4">
      <div className="flex items-center gap-2 text-[#0e7490]">
        <span className="size-5">{icon}</span>
        <span className="text-xs font-black uppercase text-[#7a5a15]">
          {label}
        </span>
      </div>
      <p className="mt-2 truncate text-lg font-black">{value}</p>
    </div>
  );
}

function PortalList({
  empty,
  rows,
}: {
  empty: string;
  rows: { id: string; meta: string; title: string }[];
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-[#ead9a2]">
      {rows.length ? (
        rows.slice(0, 8).map((row) => (
          <div
            className="grid gap-1 border-b border-[#ead9a2] bg-white px-3 py-2 text-sm last:border-b-0 sm:grid-cols-[1fr_auto]"
            key={row.id}
          >
            <span className="min-w-0 truncate font-black">{row.title}</span>
            <span className="text-[#7a5a15]">{row.meta}</span>
          </div>
        ))
      ) : (
        <div className="bg-white px-3 py-4 text-sm font-semibold text-[#7a5a15]">
          {empty}
        </div>
      )}
    </div>
  );
}

function readAccounts() {
  try {
    const rawValue = localStorage.getItem(accountStorageKey);
    const parsed = rawValue ? JSON.parse(rawValue) : [];
    const storedAccounts = Array.isArray(parsed)
      ? parsed.filter(isPanelAccount)
      : [];
    const byUsername = new Map<string, PanelAccount>();

    [...seedAccounts, ...storedAccounts].forEach((account) => {
      byUsername.set(account.username.toLowerCase(), account);
    });

    return Array.from(byUsername.values());
  } catch {
    return seedAccounts;
  }
}

function isPanelAccount(value: unknown): value is PanelAccount {
  if (!value || typeof value !== "object") {
    return false;
  }

  const account = value as Partial<PanelAccount>;
  return (
    typeof account.businessName === "string" &&
    (account.businessType === "restaurant" || account.businessType === "seller") &&
    typeof account.citySlug === "string" &&
    typeof account.password === "string" &&
    typeof account.username === "string"
  );
}

function generatePassword() {
  return `jutsu-${Math.random().toString(36).slice(2, 8)}`;
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "partner"
  );
}

function formatKrw(value: number) {
  return `${new Intl.NumberFormat("ko-KR").format(value)} KRW`;
}
