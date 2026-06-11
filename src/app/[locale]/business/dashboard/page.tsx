import { BusinessAdminDashboard } from "@/components/business-admin-dashboard";

export default async function LocaleBusinessDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <BusinessAdminDashboard basePath={`/${locale}/business`} />;
}
