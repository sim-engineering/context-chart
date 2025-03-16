export const sampleData = {
  "2023-01-01": {
    currencies: [
      { symbol: "BTC", price: 42000, change_1d: 2.5, change_7d: -1.2 },
      { symbol: "ETH", price: 2200, change_1d: 1.8, change_7d: 3.5 },
      { symbol: "DOGE", price: 0.08, change_1d: 5.2, change_7d: -2.1 },
      { symbol: "PEPE", price: 0.000001, change_1d: 12.5, change_7d: 25.8 },
    ],
  },
  "2023-01-02": {
    currencies: [
      { symbol: "BTC", price: 43050, change_1d: 2.5, change_7d: -0.8 },
      { symbol: "ETH", price: 2240, change_1d: 1.8, change_7d: 4.2 },
      { symbol: "DOGE", price: 0.082, change_1d: 2.5, change_7d: -1.5 },
      { symbol: "PEPE", price: 0.0000012, change_1d: 20.0, change_7d: 30.2 },
    ],
  },
  "2023-01-03": {
    currencies: [
      { symbol: "BTC", price: 42500, change_1d: -1.3, change_7d: -0.5 },
      { symbol: "ETH", price: 2280, change_1d: 1.8, change_7d: 5.1 },
      { symbol: "DOGE", price: 0.079, change_1d: -3.7, change_7d: -0.8 },
      { symbol: "PEPE", price: 0.0000011, change_1d: -8.3, change_7d: 22.5 },
    ],
  },
  "2023-01-04": {
    currencies: [
      { symbol: "BTC", price: 43200, change_1d: 1.6, change_7d: 0.2 },
      { symbol: "ETH", price: 2310, change_1d: 1.3, change_7d: 5.8 },
      { symbol: "DOGE", price: 0.081, change_1d: 2.5, change_7d: -0.2 },
      { symbol: "PEPE", price: 20000, change_1d: 18.2, change_7d: 25.1 },
    ],
  },
  "2023-01-05": {
    currencies: [
      { symbol: "BTC", price: 44100, change_1d: 2.1, change_7d: 1.5 },
      { symbol: "ETH", price: 2350, change_1d: 1.7, change_7d: 6.2 },
      { symbol: "DOGE", price: 0.085, change_1d: 4.9, change_7d: 1.2 },
      { symbol: "PEPE", price: 20000, change_1d: 15.4, change_7d: 28.3 },
    ],
  },
  "2023-01-06": {
    currencies: [
      { symbol: "BTC", price: 43800, change_1d: -0.7, change_7d: 2.1 },
      { symbol: "ETH", price: 2330, change_1d: -0.9, change_7d: 5.5 },
      { symbol: "DOGE", price: 0.083, change_1d: -2.4, change_7d: 2.5 },
      { symbol: "PEPE", price: 0.0000014, change_1d: -6.7, change_7d: 27.2 },
    ],
  },
  "2023-01-07": {
    currencies: [
      { symbol: "BTC", price: 44500, change_1d: 1.6, change_7d: 2.8 },
      { symbol: "ETH", price: 2380, change_1d: 2.1, change_7d: 6.8 },
      { symbol: "DOGE", price: 0.086, change_1d: 3.6, change_7d: 3.8 },
      { symbol: "PEPE", price: 0.0000016, change_1d: 14.3, change_7d: 30.5 },
    ],
  },
};

export const CURRENCY_COLORS: Record<string, string> = {
  BTC: "#F7931A", // Bitcoin orange
  ETH: "#627EEA", // Ethereum blue
  DOGE: "#C3A634", // Dogecoin gold
  PEPE: "#00CC00", // Pepe green
};

export const sampleNewsEvents = [
  {
    date: "2023-01-02",
    title: "Major Exchange Adds New Trading Pairs",
    content:
      "A leading cryptocurrency exchange announced the addition of several new trading pairs, expanding options for traders.",
    impact: 6,
    sentiment: "positive",
    source: "CryptoNews",
  },
  {
    date: "2023-01-04",
    title: "PEPE Meme Coin Gains Popularity",
    content:
      "The PEPE meme coin has seen a surge in popularity on social media platforms, driving increased trading volume.",
    impact: 7,
    sentiment: "positive",
    source: "MemeWatch",
  },
  {
    date: "2023-01-05",
    title: "Regulatory Framework Announced",
    content:
      "Government officials unveiled a new regulatory framework for cryptocurrencies, providing more clarity for institutional investors.",
    impact: 8,
    sentiment: "positive",
    source: "Financial Times",
  },
  {
    date: "2023-01-06",
    title: "Network Congestion Issues",
    content:
      "The Bitcoin network experienced significant congestion, leading to higher transaction fees and slower confirmation times.",
    impact: 7,
    sentiment: "negative",
    source: "Blockchain Monitor",
  },
];
