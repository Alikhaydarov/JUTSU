import { NextRequest, NextResponse } from "next/server";
import { getCatalogData } from "@/lib/catalog";
import { normalizeLocale } from "@/lib/i18n";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const locale = normalizeLocale(searchParams.get("lang") ?? "uz");
  const citySlug = searchParams.get("city") ?? "seoul";

  const data = await getCatalogData({ locale, citySlug });

  return NextResponse.json(data);
}
