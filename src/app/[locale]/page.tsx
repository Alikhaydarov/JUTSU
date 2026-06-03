import { CatalogApp } from "@/components/catalog-app";
import { getCatalogData } from "@/lib/catalog";
import { normalizeLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ city?: string }>;
};

export default async function LocalePage({ params, searchParams }: PageProps) {
  const { locale: localeParam } = await params;
  const { city } = await searchParams;
  const locale = normalizeLocale(localeParam);
  const data = await getCatalogData({
    locale,
    citySlug: city ?? "seoul",
  });

  return <CatalogApp initialData={data} locale={locale} />;
}
