/**
 * Currency and date localization utilities
 *
 * Supports multi-tenant localization based on tenant settings.
 */

/**
 * Supported currencies
 */
export enum Currency {
  USD = 'USD',
  GBP = 'GBP',
  EUR = 'EUR',
  CAD = 'CAD',
  AUD = 'AUD',
}

/**
 * Currency formatting options
 */
export interface CurrencyFormatOptions {
  currency: Currency;
  locale?: string; // e.g., 'en-US', 'en-GB', 'en-EU'
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number,
  options: CurrencyFormatOptions
): string {
  const {
    currency,
    locale = getDefaultLocaleForCurrency(currency),
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

/**
 * Format currency amount in cents (for display)
 */
export function formatCurrencyFromCents(
  amountCents: number,
  options: CurrencyFormatOptions
): string {
  return formatCurrency(amountCents / 100, options);
}

/**
 * Get default locale for currency
 */
function getDefaultLocaleForCurrency(currency: Currency): string {
  switch (currency) {
    case Currency.GBP:
      return 'en-GB';
    case Currency.EUR:
      return 'en-EU';
    case Currency.CAD:
      return 'en-CA';
    case Currency.AUD:
      return 'en-AU';
    case Currency.USD:
    default:
      return 'en-US';
  }
}

/**
 * Date formatting options
 */
export interface DateFormatOptions {
  locale?: string;
  timeZone?: string; // IANA timezone (e.g., 'America/New_York')
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  format?: string; // Custom format string (for date-fns)
}

/**
 * Format date with timezone support
 */
export function formatDate(
  date: Date | string,
  options: DateFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const {
    locale = 'en-US',
    timeZone,
    dateStyle = 'medium',
    timeStyle,
  } = options;

  return new Intl.DateTimeFormat(locale, {
    dateStyle,
    timeStyle,
    timeZone,
  }).format(dateObj);
}

/**
 * Format date range
 */
export function formatDateRange(
  startDate: Date | string,
  endDate: Date | string,
  options: DateFormatOptions
): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const {
    locale = 'en-US',
    timeZone,
    dateStyle = 'medium',
  } = options;

  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle,
    timeZone,
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency, locale?: string): string {
  const formatter = new Intl.NumberFormat(locale || getDefaultLocaleForCurrency(currency), {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Extract symbol from formatted string
  const parts = formatter.formatToParts(1);
  const symbolPart = parts.find(part => part.type === 'currency');
  return symbolPart?.value || currency;
}

/**
 * Parse currency string to number (in cents)
 */
export function parseCurrencyToCents(
  currencyString: string,
  currency: Currency
): number {
  // Remove currency symbols and whitespace
  const cleaned = currencyString
    .replace(/[^\d.,-]/g, '')
    .replace(/,/g, '');

  const amount = parseFloat(cleaned);
  if (isNaN(amount)) {
    return 0;
  }

  return Math.round(amount * 100); // Convert to cents
}

/**
 * Tenant locale configuration (to be fetched from backend)
 */
export interface TenantLocaleConfig {
  currency: Currency;
  locale: string;
  timeZone: string;
}

/**
 * Default tenant locale config
 */
export const DEFAULT_TENANT_LOCALE: TenantLocaleConfig = {
  currency: Currency.USD,
  locale: 'en-US',
  timeZone: 'America/New_York',
};

/**
 * Format currency using tenant config
 */
export function formatCurrencyForTenant(
  amount: number,
  tenantConfig: TenantLocaleConfig = DEFAULT_TENANT_LOCALE
): string {
  return formatCurrency(amount, {
    currency: tenantConfig.currency,
    locale: tenantConfig.locale,
  });
}

/**
 * Format date using tenant config
 */
export function formatDateForTenant(
  date: Date | string,
  tenantConfig: TenantLocaleConfig = DEFAULT_TENANT_LOCALE,
  options: Partial<DateFormatOptions> = {}
): string {
  return formatDate(date, {
    locale: tenantConfig.locale,
    timeZone: tenantConfig.timeZone,
    ...options,
  });
}









