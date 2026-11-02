// Shared formatting helpers. Views and modals should use these instead of defining their own.
import { convertAmount } from './currency.js'

const LOCALE_TAGS = { en: 'en-US', ja: 'ja-JP' }
const localeTag = (locale) => LOCALE_TAGS[locale] || locale

export const currencySymbol = (currency) => (currency === 'JPY' ? '¥' : '$')

/**
 * Format a USD amount in the active currency.
 *
 * All amounts in the data are USD. The old code put a yen sign in front of the raw USD number
 * when the language was Japanese (so $12.00 showed as ¥12.00). This always converts first,
 * so never prefix a raw number with a currency symbol yourself.
 *
 * options.decimals - fraction digits for USD (yen never shows decimals)
 * options.compact  - 1.2M / 45K style for chart labels
 */
export function formatMoney(amountUsd, currency = 'USD', { decimals = 0, compact = false } = {}) {
  const converted = convertAmount(Number(amountUsd) || 0, currency)
  const symbol = currencySymbol(currency)
  const sign = converted < 0 ? '-' : ''
  const abs = Math.abs(converted)

  if (compact) {
    if (abs >= 1_000_000) return `${sign}${symbol}${(abs / 1_000_000).toFixed(1)}M`
    if (abs >= 1_000) return `${sign}${symbol}${Math.round(abs / 1_000)}K`
  }

  const digits = currency === 'JPY' ? 0 : decimals
  const text = abs.toLocaleString(currency === 'JPY' ? 'ja-JP' : 'en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })
  return `${sign}${symbol}${text}`
}

const DEFAULT_DATE_OPTIONS = { year: 'numeric', month: 'short', day: 'numeric' }
const dateFormatters = new Map()

/**
 * Format a date for display in the given locale ('en' | 'ja').
 *
 * "YYYY-MM-DD" strings are built as local dates: new Date('2025-03-01') is midnight UTC, which
 * displays as Feb 28 in any timezone west of UTC. Formatters are cached because creating an
 * Intl.DateTimeFormat per table cell was measurably slow.
 */
export function formatDate(value, locale = 'en', options = DEFAULT_DATE_OPTIONS) {
  if (!value) return ''
  let date
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value))
  if (dateOnly) {
    date = new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
  } else {
    date = new Date(value)
  }
  if (isNaN(date.getTime())) return ''

  const cacheKey = `${locale}|${JSON.stringify(options)}`
  let formatter = dateFormatters.get(cacheKey)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(localeTag(locale), options)
    dateFormatters.set(cacheKey, formatter)
  }
  return formatter.format(date)
}

/**
 * "YYYY-MM" for an ISO-style date string, or '' if it is not one.
 *
 * Order dates have no timezone ("2025-02-01T03:00:00"). Converting through Date and
 * toISOString() shifts them to UTC, which moves early-morning orders into the previous
 * month for users east of UTC (for example Japan). Slicing the string avoids any
 * timezone math, so every view buckets the same order into the same month.
 */
export function monthKey(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}/.test(value) ? value.slice(0, 7) : ''
}
