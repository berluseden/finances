import type { Currency } from '@/types/models';

/**
 * Currency utilities for DOP and USD
 */

export const CURRENCIES: Record<Currency, { symbol: string; name: string; locale: string }> = {
  DOP: {
    symbol: 'RD$',
    name: 'Peso Dominicano',
    locale: 'es-DO',
  },
  USD: {
    symbol: '$',
    name: 'Dólar Estadounidense',
    locale: 'en-US',
  },
};

/**
 * Format currency amount with proper locale and symbol
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const currencyInfo = CURRENCIES[currency];
  const formatted = new Intl.NumberFormat(currencyInfo.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  const sign = amount < 0 ? '-' : '';
  return `${sign}${currencyInfo.symbol}${formatted}`;
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]+/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Convert amount from one currency to another using manual exchange rate
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) return amount;

  // If converting from DOP to USD, divide by rate
  // If converting from USD to DOP, multiply by rate
  if (fromCurrency === 'DOP' && toCurrency === 'USD') {
    return amount / exchangeRate;
  }

  return amount * exchangeRate;
}

/**
 * Calculate total in DOP considering exchange rate
 */
export function calculateTotalDOP(
  amountDOP: number,
  amountUSD: number,
  exchangeRate: number
): number {
  return amountDOP + amountUSD * exchangeRate;
}

/**
 * Calculate total in USD considering exchange rate
 */
export function calculateTotalUSD(
  amountDOP: number,
  amountUSD: number,
  exchangeRate: number
): number {
  return amountDOP / exchangeRate + amountUSD;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCIES[currency].symbol;
}
