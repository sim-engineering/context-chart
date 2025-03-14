// Generate random number between min and max
const randomNumber = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// Generate random price change
const randomChange = (volatility: number) => {
  return (Math.random() - 0.5) * 2 * volatility;
};

// Asset types with their respective volatility
const assetTypes = {
  crypto: { volatility: 15, priceRange: [0.01, 50000] },
  Indices: { volatility: 3, priceRange: [1000, 40000] },
  Commodities: { volatility: 5, priceRange: [10, 2000] },
  Bonds: { volatility: 1, priceRange: [80, 120] },
  Forex: { volatility: 2, priceRange: [0.5, 2] },
};

// Sample assets for each type
const assets = {
  crypto: [
    { symbol: "BTC", name: "Bitcoin", marketCapMultiplier: 100 },
    { symbol: "ETH", name: "Ethereum", marketCapMultiplier: 40 },
    { symbol: "BNB", name: "Binance Coin", marketCapMultiplier: 10 },
    { symbol: "SOL", name: "Solana", marketCapMultiplier: 8 },
    { symbol: "ADA", name: "Cardano", marketCapMultiplier: 5 },
    { symbol: "XRP", name: "Ripple", marketCapMultiplier: 4 },
    { symbol: "DOT", name: "Polkadot", marketCapMultiplier: 3 },
    { symbol: "DOGE", name: "Dogecoin", marketCapMultiplier: 2 },
    { symbol: "AVAX", name: "Avalanche", marketCapMultiplier: 2 },
    { symbol: "LINK", name: "Chainlink", marketCapMultiplier: 1 },
    { symbol: "LTC", name: "Litecoin", marketCapMultiplier: 15 },
    { symbol: "MATIC", name: "Polygon", marketCapMultiplier: 6 },
    { symbol: "UNI", name: "Uniswap", marketCapMultiplier: 4 },
    { symbol: "AAVE", name: "Aave", marketCapMultiplier: 5 },
    { symbol: "SUSHI", name: "SushiSwap", marketCapMultiplier: 3 },
    { symbol: "FTM", name: "Fantom", marketCapMultiplier: 4 },
    { symbol: "XLM", name: "Stellar", marketCapMultiplier: 3 },
    { symbol: "VET", name: "VeChain", marketCapMultiplier: 2 },
    { symbol: "TRX", name: "Tron", marketCapMultiplier: 1 },
    { symbol: "FIL", name: "Filecoin", marketCapMultiplier: 6 },
  ],
  Indices: [
    { symbol: "SPX", name: "S&P 500", marketCapMultiplier: 200 },
    { symbol: "NDX", name: "Nasdaq 100", marketCapMultiplier: 150 },
    { symbol: "DJI", name: "Dow Jones", marketCapMultiplier: 120 },
    { symbol: "RUT", name: "Russell 2000", marketCapMultiplier: 50 },
    { symbol: "FTSE", name: "FTSE 100", marketCapMultiplier: 40 },
    { symbol: "DAX", name: "DAX 40", marketCapMultiplier: 30 },
    { symbol: "CAC", name: "CAC 40", marketCapMultiplier: 25 },
    { symbol: "N225", name: "Nikkei 225", marketCapMultiplier: 35 },
    { symbol: "HSI", name: "Hang Seng", marketCapMultiplier: 30 },
    { symbol: "SSEC", name: "Shanghai Composite", marketCapMultiplier: 40 },
    { symbol: "STOXX", name: "STOXX Europe 600", marketCapMultiplier: 45 },
    { symbol: "BSE", name: "Bombay Stock Exchange", marketCapMultiplier: 50 },
    {
      symbol: "KOSPI",
      name: "Korea Composite Stock Price Index",
      marketCapMultiplier: 60,
    },
    { symbol: "ASX", name: "ASX 200", marketCapMultiplier: 65 },
    { symbol: "AEX", name: "AEX Index", marketCapMultiplier: 45 },
    { symbol: "IBEX", name: "IBEX 35", marketCapMultiplier: 55 },
    { symbol: "BOVESPA", name: "Bovespa Index", marketCapMultiplier: 50 },
    { symbol: "TA35", name: "TA-35", marketCapMultiplier: 40 },
    { symbol: "MEXBOL", name: "Mexican Stock Index", marketCapMultiplier: 35 },
  ],
  Commodities: [
    { symbol: "GC", name: "Gold", marketCapMultiplier: 60 },
    { symbol: "SI", name: "Silver", marketCapMultiplier: 20 },
    { symbol: "CL", name: "Crude Oil", marketCapMultiplier: 50 },
    { symbol: "NG", name: "Natural Gas", marketCapMultiplier: 15 },
    { symbol: "HG", name: "Copper", marketCapMultiplier: 10 },
    { symbol: "PL", name: "Platinum", marketCapMultiplier: 5 },
    { symbol: "PA", name: "Palladium", marketCapMultiplier: 3 },
    { symbol: "CT", name: "Cotton", marketCapMultiplier: 2 },
    { symbol: "KC", name: "Coffee", marketCapMultiplier: 2 },
    { symbol: "SB", name: "Sugar", marketCapMultiplier: 1 },
    { symbol: "OJ", name: "Orange Juice", marketCapMultiplier: 4 },
    { symbol: "WTI", name: "West Texas Intermediate", marketCapMultiplier: 6 },
    { symbol: "BRN", name: "Brent Crude", marketCapMultiplier: 8 },
    { symbol: "RICE", name: "Rice", marketCapMultiplier: 3 },
    { symbol: "WHEAT", name: "Wheat", marketCapMultiplier: 7 },
    { symbol: "SOY", name: "Soybean", marketCapMultiplier: 9 },
    { symbol: "LUMBER", name: "Lumber", marketCapMultiplier: 5 },
    { symbol: "COTTON", name: "Cotton", marketCapMultiplier: 6 },
    { symbol: "AL", name: "Aluminum", marketCapMultiplier: 8 },
    { symbol: "TIN", name: "Tin", marketCapMultiplier: 7 },
  ],
  Bonds: [
    { symbol: "US10Y", name: "US 10 Year Treasury", marketCapMultiplier: 80 },
    { symbol: "US2Y", name: "US 2 Year Treasury", marketCapMultiplier: 60 },
    { symbol: "US30Y", name: "US 30 Year Treasury", marketCapMultiplier: 70 },
    { symbol: "DE10Y", name: "German 10 Year Bund", marketCapMultiplier: 40 },
    { symbol: "UK10Y", name: "UK 10 Year Gilt", marketCapMultiplier: 35 },
    { symbol: "JP10Y", name: "Japan 10 Year Bond", marketCapMultiplier: 30 },
    { symbol: "FR10Y", name: "France 10 Year Bond", marketCapMultiplier: 25 },
    { symbol: "IT10Y", name: "Italy 10 Year Bond", marketCapMultiplier: 20 },
    {
      symbol: "AU10Y",
      name: "Australia 10 Year Bond",
      marketCapMultiplier: 15,
    },
    { symbol: "CA10Y", name: "Canada 10 Year Bond", marketCapMultiplier: 15 },
    { symbol: "ES10Y", name: "Spain 10 Year Bond", marketCapMultiplier: 25 },
    { symbol: "BR10Y", name: "Brazil 10 Year Bond", marketCapMultiplier: 35 },
    { symbol: "MX10Y", name: "Mexico 10 Year Bond", marketCapMultiplier: 20 },
    { symbol: "IN10Y", name: "India 10 Year Bond", marketCapMultiplier: 40 },
    { symbol: "CN10Y", name: "China 10 Year Bond", marketCapMultiplier: 50 },
    {
      symbol: "SG10Y",
      name: "Singapore 10 Year Bond",
      marketCapMultiplier: 30,
    },
    {
      symbol: "ZA10Y",
      name: "South Africa 10 Year Bond",
      marketCapMultiplier: 40,
    },
    { symbol: "RU10Y", name: "Russia 10 Year Bond", marketCapMultiplier: 30 },
    {
      symbol: "KR10Y",
      name: "South Korea 10 Year Bond",
      marketCapMultiplier: 35,
    },
    {
      symbol: "SA10Y",
      name: "Saudi Arabia 10 Year Bond",
      marketCapMultiplier: 25,
    },
  ],
  Forex: [
    { symbol: "EUR/USD", name: "Euro / US Dollar", marketCapMultiplier: 25 },
    {
      symbol: "USD/JPY",
      name: "US Dollar / Japanese Yen",
      marketCapMultiplier: 20,
    },
    {
      symbol: "GBP/USD",
      name: "British Pound / US Dollar",
      marketCapMultiplier: 15,
    },

    {
      symbol: "USD/CNY",
      name: "US Dollar / Chinese Yuan",
      marketCapMultiplier: 7,
    },
    {
      symbol: "USD/INR",
      name: "US Dollar / Indian Rupee",
      marketCapMultiplier: 6,
    },
    {
      symbol: "USD/MXN",
      name: "US Dollar / Mexican Peso",
      marketCapMultiplier: 4,
    },
    {
      symbol: "NZD/JPY",
      name: "New Zealand Dollar / Japanese Yen",
      marketCapMultiplier: 5,
    },
    {
      symbol: "EUR/AUD",
      name: "Euro / Australian Dollar",
      marketCapMultiplier: 6,
    },
    {
      symbol: "GBP/AUD",
      name: "British Pound / Australian Dollar",
      marketCapMultiplier: 4,
    },
    {
      symbol: "CAD/JPY",
      name: "Canadian Dollar / Japanese Yen",
      marketCapMultiplier: 6,
    },
  ],
};

export const generateDummyData = (timeRange: number, filters: any) => {
  const result = [];
  let id = 1;

  // Filter asset types based on user selection
  const filteredTypes = Object.keys(assetTypes).filter((type) => {
    const key = type.toLowerCase().replace(/[^a-z]/g, "");
    return filters[key];
  });

  filteredTypes.forEach((type) => {
    const { volatility, priceRange } = assetTypes[type];
    const typeAssets = assets[type];

    typeAssets.forEach((asset) => {
      // Base price in the specified range
      const basePrice = randomNumber(priceRange[0], priceRange[1]);

      // Generate change based on volatility and time range
      // Longer time ranges have potentially larger changes
      const timeMultiplier = Math.sqrt(timeRange / 30); // Square root to dampen the effect
      const change = randomChange(volatility * timeMultiplier);

      // Calculate price based on change
      const price = basePrice * (1 + change / 100);

      // Generate random historical data
      const high = basePrice * (1 + randomChange(volatility) / 100 + 0.05);
      const low = basePrice * (1 + randomChange(volatility) / 100 - 0.05);

      // Generate random volume
      const volume = basePrice * randomNumber(1000000, 10000000);

      // Use the marketCapMultiplier to create more realistic relative market caps
      const marketCap =
        basePrice *
        randomNumber(10000000, 100000000) *
        (asset.marketCapMultiplier || 1);

      // Generate performance for different time periods
      const performance = {
        day: randomChange(volatility * 0.5),
        week: randomChange(volatility * 0.8),
        month: randomChange(volatility * 1.2),
      };

      result.push({
        id: id++,
        symbol: asset.symbol,
        name: asset.name,
        price,
        change,
        high,
        low,
        volume,
        marketCap,
        performance,
        type,
        featured: Math.random() > 0.7, // 30% chance to be featured
      });
    });
  });

  return result;
};
