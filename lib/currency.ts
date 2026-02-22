/**
 * Currency formatting utilities using Intl.NumberFormat
 */

// Common currencies with their display info
export const CURRENCIES = {
  PHP: { name: 'Philippine Peso', symbol: '₱', locale: 'en-PH' },
  AED: { name: 'UAE Dirham', symbol: 'AED', locale: 'en-AE' },
  USD: { name: 'US Dollar', symbol: '$', locale: 'en-US' },
  EUR: { name: 'Euro', symbol: '€', locale: 'de-DE' },
  GBP: { name: 'British Pound', symbol: '£', locale: 'en-GB' },
  JPY: { name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP' },
  INR: { name: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
  SAR: { name: 'Saudi Riyal', symbol: '﷼', locale: 'ar-SA' },
  CAD: { name: 'Canadian Dollar', symbol: '$', locale: 'en-CA' },
  AUD: { name: 'Australian Dollar', symbol: '$', locale: 'en-AU' },
} as const

export type CurrencyCode = keyof typeof CURRENCIES

// Cache formatters for performance
const formatterCache = new Map<string, Intl.NumberFormat>()

/**
 * Get a cached number formatter
 */
function getFormatter(
  currency: string,
  locale?: string,
  options?: Partial<Intl.NumberFormatOptions>
): Intl.NumberFormat {
  const cacheKey = `${currency}-${locale}-${JSON.stringify(options)}`
  
  if (!formatterCache.has(cacheKey)) {
    const currencyInfo = CURRENCIES[currency as CurrencyCode]
    const formatterLocale = locale || currencyInfo?.locale || 'en-US'
    
    formatterCache.set(
      cacheKey,
      new Intl.NumberFormat(formatterLocale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        ...options,
      })
    )
  }
  
  return formatterCache.get(cacheKey)!
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'AED',
  locale?: string
): string {
  return getFormatter(currency, locale).format(amount)
}

/**
 * Format a number as currency with compact notation (e.g., 1.5K, 2.3M)
 */
export function formatCurrencyCompact(
  amount: number,
  currency: string = 'AED',
  locale?: string
): string {
  return getFormatter(currency, locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(amount)
}

/**
 * Format a number as currency without the symbol
 */
export function formatCurrencyNumber(
  amount: number,
  currency: string = 'AED',
  locale?: string
): string {
  return getFormatter(currency, locale, {
    style: 'decimal',
  }).format(amount)
}

/**
 * Parse a currency string back to a number
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and whitespace
  const cleaned = value.replace(/[^\d.,\-]/g, '')
  
  // Handle different decimal separators
  const normalized = cleaned
    .replace(/,/g, '') // Remove thousand separators
    .replace(/\./g, '.') // Ensure dot as decimal separator
  
  const parsed = parseFloat(normalized)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currency: string): string {
  const info = CURRENCIES[currency as CurrencyCode]
  if (info) return info.symbol
  
  // Fallback: extract symbol from formatter
  const formatter = getFormatter(currency)
  const parts = formatter.formatToParts(0)
  const currencyPart = parts.find((p) => p.type === 'currency')
  return currencyPart?.value || currency
}

/**
 * Get currency name for a currency code
 */
export function getCurrencyName(currency: string): string {
  return CURRENCIES[currency as CurrencyCode]?.name || currency
}

/**
 * Get list of available currencies for a select dropdown
 */
export function getCurrencyOptions(): Array<{ value: string; label: string; symbol: string }> {
  return Object.entries(CURRENCIES).map(([code, info]) => ({
    value: code,
    label: `${code} - ${info.name}`,
    symbol: info.symbol,
  }))
}
