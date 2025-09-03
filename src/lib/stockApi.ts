// Stock API integration layer for fetching real-time stock data
import { StockData, StockQuote, StockSearchResult, HistoricalData } from '@/types/stock';

const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

// Fallback demo data for when API is not available
const DEMO_STOCK_DATA: StockData = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  price: 175.43,
  change: 2.15,
  changePercent: 1.24,
  volume: 45678900,
  marketCap: 2750000000000,
  peRatio: 28.5,
  eps: 6.15,
  dividend: 0.96,
  dividendYield: 0.55,
  high52Week: 198.23,
  low52Week: 124.17,
  avgVolume: 52000000,
  beta: 1.29,
  sector: 'Technology',
  industry: 'Consumer Electronics',
  description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
  employees: 164000,
  founded: '1976',
  headquarters: 'Cupertino, CA',
  website: 'https://www.apple.com'
};

const DEMO_HISTORICAL_DATA: HistoricalData[] = [
  { date: '2024-01-01', open: 170.00, high: 175.50, low: 169.80, close: 175.43, volume: 45678900 },
  { date: '2024-01-02', open: 175.43, high: 178.20, low: 174.10, close: 177.89, volume: 52341200 },
  { date: '2024-01-03', open: 177.89, high: 179.45, low: 176.30, close: 178.12, volume: 48923400 },
  { date: '2024-01-04', open: 178.12, high: 180.67, low: 177.55, close: 179.34, volume: 51234500 },
  { date: '2024-01-05', open: 179.34, high: 181.23, low: 178.90, close: 180.45, volume: 47856300 }
];

export class StockApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'StockApiError';
  }
}

// Search for stocks by symbol or company name
export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  if (!query || query.length < 1) {
    return [];
  }

  try {
    const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new StockApiError(`Search failed: ${response.statusText}`, response.status);
    }

    const data = await response.json();
    
    if (data['Error Message']) {
      throw new StockApiError(data['Error Message']);
    }

    if (data['Note']) {
      // API rate limit reached, return demo data
      return [
        { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', region: 'United States', currency: 'USD' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Equity', region: 'United States', currency: 'USD' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Equity', region: 'United States', currency: 'USD' },
        { symbol: 'TSLA', name: 'Tesla, Inc.', type: 'Equity', region: 'United States', currency: 'USD' },
        { symbol: 'AMZN', name: 'Amazon.com, Inc.', type: 'Equity', region: 'United States', currency: 'USD' }
      ].filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    const matches = data['bestMatches'] || [];
    return matches.map((match: any) => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
      currency: match['8. currency']
    }));
  } catch (error) {
    console.error('Stock search error:', error);
    // Return demo data on error
    return [
      { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', region: 'United States', currency: 'USD' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Equity', region: 'United States', currency: 'USD' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Equity', region: 'United States', currency: 'USD' }
    ].filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );
  }
}

// Get current stock quote
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  try {
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new StockApiError(`Quote fetch failed: ${response.statusText}`, response.status);
    }

    const data = await response.json();
    
    if (data['Error Message']) {
      throw new StockApiError(data['Error Message']);
    }

    if (data['Note']) {
      // API rate limit reached, return demo data
      return {
        symbol: symbol.toUpperCase(),
        price: 175.43,
        change: 2.15,
        changePercent: 1.24,
        volume: 45678900,
        lastUpdated: new Date().toISOString()
      };
    }

    const quote = data['Global Quote'];
    if (!quote) {
      throw new StockApiError('Invalid symbol or no data available');
    }

    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      lastUpdated: quote['07. latest trading day']
    };
  } catch (error) {
    console.error('Stock quote error:', error);
    // Return demo data on error
    return {
      symbol: symbol.toUpperCase(),
      price: 175.43,
      change: 2.15,
      changePercent: 1.24,
      volume: 45678900,
      lastUpdated: new Date().toISOString()
    };
  }
}

// Get detailed stock information
export async function getStockData(symbol: string): Promise<StockData> {
  try {
    // Get basic quote first
    const quote = await getStockQuote(symbol);
    
    // Get company overview
    const overviewUrl = `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const overviewResponse = await fetch(overviewUrl);
    
    if (!overviewResponse.ok) {
      throw new StockApiError(`Overview fetch failed: ${overviewResponse.statusText}`, overviewResponse.status);
    }

    const overviewData = await overviewResponse.json();
    
    if (overviewData['Note'] || !overviewData['Symbol']) {
      // API rate limit or no data, return demo data with updated symbol
      return {
        ...DEMO_STOCK_DATA,
        symbol: symbol.toUpperCase(),
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        volume: quote.volume
      };
    }

    return {
      symbol: overviewData['Symbol'],
      name: overviewData['Name'],
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      volume: quote.volume,
      marketCap: parseInt(overviewData['MarketCapitalization']) || 0,
      peRatio: parseFloat(overviewData['PERatio']) || 0,
      eps: parseFloat(overviewData['EPS']) || 0,
      dividend: parseFloat(overviewData['DividendPerShare']) || 0,
      dividendYield: parseFloat(overviewData['DividendYield']) || 0,
      high52Week: parseFloat(overviewData['52WeekHigh']) || 0,
      low52Week: parseFloat(overviewData['52WeekLow']) || 0,
      avgVolume: parseInt(overviewData['50DayMovingAverage']) || 0,
      beta: parseFloat(overviewData['Beta']) || 0,
      sector: overviewData['Sector'] || 'N/A',
      industry: overviewData['Industry'] || 'N/A',
      description: overviewData['Description'] || 'No description available',
      employees: parseInt(overviewData['FullTimeEmployees']) || 0,
      founded: 'N/A',
      headquarters: overviewData['Address'] || 'N/A',
      website: overviewData['OfficialSite'] || 'N/A'
    };
  } catch (error) {
    console.error('Stock data error:', error);
    // Return demo data on error
    const quote = await getStockQuote(symbol);
    return {
      ...DEMO_STOCK_DATA,
      symbol: symbol.toUpperCase(),
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      volume: quote.volume
    };
  }
}

// Get historical price data
export async function getHistoricalData(symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' | 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<HistoricalData[]> {
  try {
    let functionName = 'TIME_SERIES_DAILY';
    if (interval !== 'daily' && interval !== 'weekly' && interval !== 'monthly') {
      functionName = 'TIME_SERIES_INTRADAY';
    } else if (interval === 'weekly') {
      functionName = 'TIME_SERIES_WEEKLY';
    } else if (interval === 'monthly') {
      functionName = 'TIME_SERIES_MONTHLY';
    }

    let url = `${BASE_URL}?function=${functionName}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    if (functionName === 'TIME_SERIES_INTRADAY') {
      url += `&interval=${interval}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new StockApiError(`Historical data fetch failed: ${response.statusText}`, response.status);
    }

    const data = await response.json();
    
    if (data['Error Message']) {
      throw new StockApiError(data['Error Message']);
    }

    if (data['Note']) {
      // API rate limit reached, return demo data
      return DEMO_HISTORICAL_DATA;
    }

    let timeSeriesKey = 'Time Series (Daily)';
    if (functionName === 'TIME_SERIES_INTRADAY') {
      timeSeriesKey = `Time Series (${interval})`;
    } else if (functionName === 'TIME_SERIES_WEEKLY') {
      timeSeriesKey = 'Weekly Time Series';
    } else if (functionName === 'TIME_SERIES_MONTHLY') {
      timeSeriesKey = 'Monthly Time Series';
    }

    const timeSeries = data[timeSeriesKey];
    if (!timeSeries) {
      return DEMO_HISTORICAL_DATA;
    }

    return Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'])
    })).slice(0, 100); // Limit to last 100 data points
  } catch (error) {
    console.error('Historical data error:', error);
    return DEMO_HISTORICAL_DATA;
  }
}

// Get market news (simplified implementation)
export async function getMarketNews(symbol?: string): Promise<any[]> {
  // This would typically integrate with a news API
  // For now, return demo news data
  return [
    {
      title: `${symbol || 'Market'} Shows Strong Performance`,
      summary: 'Recent market analysis indicates positive trends...',
      url: '#',
      source: 'Financial News',
      publishedAt: new Date().toISOString()
    },
    {
      title: 'Tech Sector Outlook Remains Positive',
      summary: 'Industry experts predict continued growth...',
      url: '#',
      source: 'Tech Weekly',
      publishedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];
}

// Utility function to format market cap
export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  } else {
    return `$${marketCap.toLocaleString()}`;
  }
}

// Utility function to format volume
export function formatVolume(volume: number): string {
  if (volume >= 1e9) {
    return `${(volume / 1e9).toFixed(2)}B`;
  } else if (volume >= 1e6) {
    return `${(volume / 1e6).toFixed(2)}M`;
  } else if (volume >= 1e3) {
    return `${(volume / 1e3).toFixed(2)}K`;
  } else {
    return volume.toLocaleString();
  }
}

// Utility function to format price
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

// Utility function to format percentage
export function formatPercentage(percentage: number): string {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
}