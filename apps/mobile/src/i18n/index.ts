import { ptBR, type Strings } from './pt-BR';

/**
 * Minimal i18n shim. One active locale today (pt-BR); the indirection means
 * adding en-US later is a new file + a locale switch, not a component rewrite.
 */
const locales = { 'pt-BR': ptBR } as const;
type Locale = keyof typeof locales;

let activeLocale: Locale = 'pt-BR';

export function setLocale(locale: Locale) {
  activeLocale = locale;
}

/** The active string table. Prefer the `useStrings` hook inside components. */
export function strings(): Strings {
  return locales[activeLocale];
}

/** Hook form, so screens read `const t = useStrings()`. */
export function useStrings(): Strings {
  return strings();
}
