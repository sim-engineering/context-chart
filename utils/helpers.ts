import { CURRENCY_COLORS } from "@/types/mock";

export const getCurrencyColor = (symbol: string): string => {
  return (
    CURRENCY_COLORS[symbol] ||
    `hsl(${
      symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360
    }, 70%, 50%)`
  );
};

export function daysAgoToDate(days: number): string {
  const today = new Date();
  today.setDate(today.getDate() - days - 1);

  const dayOfWeek = today.getDay();
  if (dayOfWeek === 6) today.setDate(today.getDate() - 1);
  if (dayOfWeek === 0) today.setDate(today.getDate() - 2);

  return today.toISOString().split("T")[0];
}

export const getChangeField = (asset: Asset, change: string) => {
  if (change === "1d") return asset.change_1d;
  if (change === "7d") return asset.change_7d;
  if (change === "1m") return asset.change_1m;
  if (change === "3m") return asset.change_3m;
  if (change === "1y") return asset.change_1y;
  return asset.change_1d;
};
