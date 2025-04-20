import { createClient } from '@supabase/supabase-js';

// Cache exchange rates for 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface ExchangeRates {
  USD: number;
  EUR: number;
  timestamp: number;
}

let cachedRates: ExchangeRates | null = null;

export async function getExchangeRates(): Promise<ExchangeRates> {
  // Check if we have cached rates that are still valid
  if (cachedRates && Date.now() - cachedRates.timestamp < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/ILS');
    const data = await response.json();
    
    // Cache the new rates
    cachedRates = {
      USD: 1 / data.rates.USD, // Convert from ILS to USD
      EUR: 1 / data.rates.EUR, // Convert from ILS to EUR
      timestamp: Date.now()
    };

    return cachedRates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Fallback to last cached rates if available
    if (cachedRates) {
      return cachedRates;
    }
    // If no cached rates available, use default rates
    return {
      USD: 3.6,
      EUR: 3.9,
      timestamp: Date.now()
    };
  }
}

export async function convertToILS(amount: number, currency: string): Promise<number> {
  if (currency === 'ILS') return amount;
  
  const rates = await getExchangeRates();
  return amount * rates[currency as keyof ExchangeRates];
}

export async function convertFromILS(amount: number, targetCurrency: string): Promise<number> {
  if (targetCurrency === 'ILS') return amount;
  
  const rates = await getExchangeRates();
  return amount / rates[targetCurrency as keyof ExchangeRates];
} 