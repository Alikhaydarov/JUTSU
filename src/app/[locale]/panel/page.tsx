import { PanelPortalApp } from "@/components/panel-portal-app";
import { getCatalogData } from "@/lib/catalog";
import { normalizeLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PanelPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const data = await getCatalogData({
    locale,
    citySlug: "seoul",
  });

  return <PanelPortalApp catalog={data} locale={locale} mode="partner" />;
}
