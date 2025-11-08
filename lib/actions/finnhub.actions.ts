'use server';

import { cache } from 'react';
import { POPULAR_STOCK_SYMBOLS } from '../constants';
import {
  formatArticle,
  formatChangePercent,
  formatMarketCapValue,
  formatPrice,
  getDateRange,
  validateArticle,
} from '../utils';

import { getWatchlistSymbolsByEmail } from './watchlist.actions';
import { auth } from '../better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const FINNHUB_BASE_URL = process.env.FINNHUB_BASE_URL!;
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY!;

// Fetch function for Finnhub API with optional caching
// 1. fetchJSON(url, 3600) → Cache for 1 hour (for static company data)
// 2. fetchJSON(url) → No caching (for live data)
const fetchJSON = async (url: string, revalidateSeconds?: number) => {
  try {
    const fetchOptions = revalidateSeconds
      ? {
          cache: 'force-cache' as const,
          next: { revalidate: revalidateSeconds },
        }
      : { cache: 'no-store' as const }; // no caching

    const res = await fetch(url, fetchOptions);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
};

// Searches for stocks by symbol or company name
// 1. No query → Returns popular stocks (AAPL, MSFT, etc.)
// 2. With query → Searches Finnhub database for matches
export const searchStocks = cache(async (query?: string) => {
  const cleanQuery = query?.trim();

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) redirect('/sign-in');
    
    const userWatchlistSymbols = await getWatchlistSymbolsByEmail(
      session.user.email
    );

    let allResults: FinnhubSearchResult[] = [];

    // Use profile API for popular stocks (better rate limits)
    if (!cleanQuery) {
      const popularStocks = POPULAR_STOCK_SYMBOLS.slice(0, 10).map(
        async (symbol) => {
          try {
            const profileData = await fetchJSON(
              `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
              3600
            );

            // Convert profile data to search result format
            if (profileData && profileData.name) {
              allResults.push({
                symbol: symbol,
                description: profileData.name,
                displaySymbol: symbol,
                type: 'Common Stock',
              });
            }
          } catch (error) {
            console.warn(`Failed to get profile for ${symbol}:`, error);
          }
        }
      );

      await Promise.all(popularStocks);
    } else {
      // Search specific stock
      const searchData = (await fetchJSON(
        `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(
          cleanQuery
        )}&token=${FINNHUB_API_KEY}`,
        1800
      )) as FinnhubSearchResponse;

      allResults = searchData?.result || [];
    }

    // Format search results
    const results = allResults
      ?.slice(0, 15)
      ?.map(
        (stock: FinnhubSearchResult): StockWithWatchlistStatus => ({
          symbol: stock.symbol.toUpperCase(),
          name: stock.description,
          exchange: stock.displaySymbol || 'US',
          type: stock.type || 'Stock',
          isInWatchlist: userWatchlistSymbols.includes(
            stock.symbol.toUpperCase()
          ),
        })
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    return results || [];
  } catch (error) {
    console.error('Error in stock search:', error);
    return [];
  }
});

// Fetches watchlist-specific news or falls back to general market news
// 1. No symbols -> Fetch general market news
// 2. With symbols -> Fetch news for each symbol
export const getNews = cache(async (symbols?: string[]) => {
  const { from, to } = getDateRange(5);

  try {
    const cleanSymbols = symbols
      ?.map((symbol) => symbol.trim().toUpperCase())
      .filter((symbol) => symbol.length > 0);

    // Case 1: Fetch company-specific news using round-robin approach
    if (cleanSymbols?.length) {
      const newsFromSymbols: MarketNewsArticle[] = [];

      // Loop up to 6 times, cycling through symbols
      for (let i = 0; i < 6; i++) {
        const symbol = cleanSymbols[i % cleanSymbols.length]; // Round-robin through symbols

        const newsData = await fetchJSON(
          `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`,
          3600
        );

        if (Array.isArray(newsData) && newsData.length) {
          const validArticles = (newsData as RawNewsArticle[]).filter(
            validateArticle
          );
          // Get one article that we haven't already added
          const articleIndex = Math.floor(i / cleanSymbols.length); // 0,1,2 for each round
          const article = validArticles[articleIndex];
          if (article) {
            newsFromSymbols.push(formatArticle(article, true, symbol));
          }
        }
      }
      // Sort by datetime and return
      return newsFromSymbols.sort((a, b) => b.datetime - a.datetime);
    }

    // Case 2: Fetch general market news (no watchlist)
    const generalNews = await fetchJSON(
      `${FINNHUB_BASE_URL}/news?category=general&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`,
      3600
    );

    // Remove duplicate articles
    const seen = new Set<string>();
    return (generalNews as RawNewsArticle[])
      .filter(validateArticle)
      .filter((article) => { 
        const uniqueKey = article.id ?? article.url ?? article.headline;
        if (seen.has(uniqueKey.toString())) return false;
        seen.add(uniqueKey.toString());
        return true;
      })
      .slice(0, 6)
      .map((article, index) => formatArticle(article, false, undefined, index));
  } catch (error) {
    console.error('Error fetching news:', error);
    throw new Error('Failed to fetch news');
  }
});

// Fetch stock details by symbol
export const getStocksDetails = cache(async (symbol: string) => {
  const cleanSymbol = symbol.trim().toUpperCase();

  try {
    const [quote, profile, financials] = await Promise.all([
      fetchJSON(
        // Price data - no caching for accuracy
        `${FINNHUB_BASE_URL}/quote?symbol=${cleanSymbol}&token=${FINNHUB_API_KEY}`
      ),
      fetchJSON(
        // Company info - cache 1hr (rarely changes)
        `${FINNHUB_BASE_URL}/stock/profile2?symbol=${cleanSymbol}&token=${FINNHUB_API_KEY}`,
        3600
      ),
      fetchJSON(
        // Financial metrics (P/E, etc.) - cache 30min
        `${FINNHUB_BASE_URL}/stock/metric?symbol=${cleanSymbol}&metric=all&token=${FINNHUB_API_KEY}`,
        1800
      ),
    ]);

    // Type cast the responses
    const quoteData = quote as QuoteData;
    const profileData = profile as ProfileData;
    const financialsData = financials as FinancialsData;

    // Check if we got valid quote and profile data
    if (!quoteData?.c || !profileData?.name)
      throw new Error('Invalid stock data received from API');

    const changePercent = quoteData.dp || 0;
    const peRatio = financialsData?.metric?.peNormalizedAnnual || null;

    return {
      symbol: cleanSymbol,
      company: profileData?.name,
      currentPrice: quoteData.c,
      changePercent,
      priceFormatted: formatPrice(quoteData.c),
      changeFormatted: formatChangePercent(changePercent),
      peRatio: peRatio?.toFixed(1) || '—',
      marketCapFormatted: formatMarketCapValue(
        profileData?.marketCapitalization || 0
      ),
    };
  } catch (error) {
    console.error(`Error fetching details for ${cleanSymbol}:`, error);
    throw new Error('Failed to fetch stock details');
  }
});
