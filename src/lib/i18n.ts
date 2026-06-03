import { Locale, locales, LocalizedText } from "./types";

export function normalizeLocale(value?: string): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : "uz";
}

export function text(value: LocalizedText, locale: Locale) {
  return value[locale] || value.uz || value.en;
}
