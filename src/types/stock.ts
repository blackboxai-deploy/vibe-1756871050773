// Stock data types and interfaces for the stock analysis application

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio?: number;
  eps?: number;
  dividend?: number;
  dividendYield?: number;
  beta?: number;
  high52Week?: number;
  low52Week?: number;
  avgVolume?: number;
  sector?: string;
  industry?: string;
  description?: string;
  website?: string;
  employees?: number;
  headquarters?: string;
  founded?: string;
  ceo?: string;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  timestamp: string;
}

export interface StockChart {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  description: string;
}

export interface MovingAverage {
  period: number;
  value: number;
  type: 'SMA' | 'EMA';
}

export interface RSI {
  value: number;
  signal: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL';
  period: number;
}

export interface MACD {
  macd: number;
  signal: number;
  histogram: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface BollingerBands {
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number;
  position: 'ABOVE' | 'BELOW' | 'WITHIN';
}

export interface FinancialRatios {
  peRatio: number;
  pegRatio: number;
  priceToBook: number;
  priceToSales: number;
  debtToEquity: number;
  currentRatio: number;
  quickRatio: number;
  returnOnEquity: number;
  returnOnAssets: number;
  profitMargin: number;
  operatingMargin: number;
  grossMargin: number;
}

export interface EarningsData {
  quarter: string;
  year: number;
  eps: number;
  epsEstimate: number;
  revenue: number;
  revenueEstimate: number;
  surprise: number;
  surprisePercent: number;
}

export interface AnalystRating {
  rating: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  targetPrice: number;
  analyst: string;
  firm: string;
  date: string;
  priceTarget: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  relevanceScore: number;
}

export interface AIAnalysis {
  summary: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  keyPoints: string[];
  risks: string[];
  opportunities: string[];
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  targetPrice?: number;
  timeHorizon: '1M' | '3M' | '6M' | '1Y';
  lastUpdated: string;
}

export interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  dayGain: number;
  dayGainPercent: number;
  positions: PortfolioPosition[];
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioPosition {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  totalGain: number;
  totalGainPercent: number;
  dayGain: number;
  dayGainPercent: number;
  weight: number;
  addedAt: string;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  addedAt: string;
  alerts?: PriceAlert[];
}

export interface PriceAlert {
  id: string;
  symbol: string;
  type: 'ABOVE' | 'BELOW';
  targetPrice: number;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

export interface MarketData {
  indices: MarketIndex[];
  sectors: SectorPerformance[];
  movers: {
    gainers: Stock[];
    losers: Stock[];
    mostActive: Stock[];
  };
  marketStatus: 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'AFTER_HOURS';
  lastUpdated: string;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface SectorPerformance {
  name: string;
  change: number;
  changePercent: number;
  volume: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  type: 'STOCK' | 'ETF' | 'MUTUAL_FUND' | 'INDEX';
  exchange: string;
  currency: string;
  country: string;
}

export interface StockScreener {
  marketCap?: {
    min?: number;
    max?: number;
  };
  peRatio?: {
    min?: number;
    max?: number;
  };
  dividendYield?: {
    min?: number;
    max?: number;
  };
  volume?: {
    min?: number;
  };
  price?: {
    min?: number;
    max?: number;
  };
  sector?: string[];
  exchange?: string[];
}

export interface ChartConfig {
  timeframe: '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y' | 'MAX';
  chartType: 'LINE' | 'CANDLESTICK' | 'AREA';
  indicators: string[];
  showVolume: boolean;
  showGrid: boolean;
  theme: 'LIGHT' | 'DARK';
}

export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
  rateLimit?: {
    remaining: number;
    reset: number;
  };
}

export interface ErrorResponse {
  error: string;
  code: string;
  message: string;
  timestamp: string;
}

// Utility types
export type TimeFrame = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';