export type PerformanceRating = {
  day: number;
  week: number;
  month: number;
};

export type Asset = {
  id: number;
  symbol: string;
  name: string;
  price: number;
  change?: number;
  change_1d?: number;
  change_7d?: number;
  change_1m?: number;
  change_3m?: number;
  change_1y?: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  performance: PerformanceRating;
  type: keyof typeof assetTypes;
  featured: boolean;
};

export type AssetType = {
  volatility: number;
  priceRange: [number, number];
};

export const assetTypes: Record<string, AssetType> = {
  crypto: { volatility: 15, priceRange: [0.01, 50000] },
  indices: { volatility: 3, priceRange: [1000, 40000] },
  commodities: { volatility: 5, priceRange: [10, 2000] },
  bonds: { volatility: 1, priceRange: [80, 120] },
  forex: { volatility: 2, priceRange: [0.5, 2] },
};
