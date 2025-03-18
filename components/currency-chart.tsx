"use client";

import { useState, useEffect, useMemo } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ComposedChart,
  ReferenceLine,
  Tooltip as RechartsTooltip,
  Line,
  type TooltipProps,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Info, TrendingDown, TrendingUp, Check, X } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

// Define the data structure
export type CurrencyData = {
  symbol: string;
  price: number;
  change_1d: number;
  change_7d: number;
};

export type CurrencyChartData = {
  [date: string]: {
    currencies: CurrencyData[];
  };
};

// Define news event type
export type NewsEvent = {
  date: string;
  title: string;
  content: string;
  impact: number;
  sentiment: "positive" | "negative" | "neutral";
  source: string;
};

interface CurrencyChartProps {
  data: CurrencyChartData;
  newsEvents?: NewsEvent[];
  title?: string;
  description?: string;
  defaultCurrencies?: string[];
  defaultTimeframe?: string;
}

// Currency colors for consistent display
const CURRENCY_COLORS: Record<string, string> = {
  BTC: "#F7931A", // Bitcoin orange
  ETH: "#627EEA", // Ethereum blue
  DOGE: "#C3A634", // Dogecoin gold
  PEPE: "#00CC00", // Pepe green
  // Add more currencies as needed
};

// Get color for a currency, with fallbacks
const getCurrencyColor = (symbol: string): string => {
  return (
    CURRENCY_COLORS[symbol] ||
    // If not in our map, generate a color based on the symbol
    `hsl(${
      symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360
    }, 70%, 50%)`
  );
};

// Update the CustomTooltip component to use the new data structure:
const CustomTooltip = ({
  active,
  payload,
  label,
  visibleCurrencies,
}: TooltipProps & { visibleCurrencies: string[] }) => {
  if (active && payload && payload.length) {
    const date = format(new Date(label as string), "MMM d, yyyy");

    return (
      <div className="p-3 rounded-md shadow-lg border bg-slate-900 border-slate-800 text-slate-200">
        <p className="font-medium">{date}</p>
        <div className="mt-2 space-y-2">
          {payload.map((entry, index) => {
            const currencySymbol = entry.dataKey as string;
            if (!currencySymbol || !visibleCurrencies.includes(currencySymbol))
              return null;

            const currencyData = entry.payload[`${currencySymbol}_data`];
            if (!currencyData) return null;

            return (
              <div
                key={`tooltip-${index}`}
                className="border-t pt-2 first:border-t-0 first:pt-0"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: getCurrencyColor(currencySymbol),
                    }}
                  />
                  <span className="font-medium">{currencySymbol}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm flex items-center justify-between gap-4">
                    <span className="text-slate-400">Price:</span>
                    <span className="font-medium">
                      ${currencyData.price.toFixed(2)}
                    </span>
                  </p>
                  <p className="text-sm flex items-center justify-between gap-4">
                    <span className="text-slate-400">24h:</span>
                    <span
                      className={cn("font-medium flex items-center", {
                        "text-emerald-500": currencyData.change_1d > 0,
                        "text-rose-500": currencyData.change_1d < 0,
                        "text-slate-500": currencyData.change_1d === 0,
                      })}
                    >
                      {currencyData.change_1d > 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : currencyData.change_1d < 0 ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : null}
                      {currencyData.change_1d > 0 ? "+" : ""}
                      {currencyData.change_1d.toFixed(2)}%
                    </span>
                  </p>
                  <p className="text-sm flex items-center justify-between gap-4">
                    <span className="text-slate-400">7d:</span>
                    <span
                      className={cn("font-medium flex items-center", {
                        "text-emerald-500": currencyData.change_7d > 0,
                        "text-rose-500": currencyData.change_7d < 0,
                        "text-slate-500": currencyData.change_7d === 0,
                      })}
                    >
                      {currencyData.change_7d > 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : currencyData.change_7d < 0 ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : null}
                      {currencyData.change_7d > 0 ? "+" : ""}
                      {currencyData.change_7d.toFixed(2)}%
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};

// Custom news bubble component
const NewsBubble = ({ event }: { event: NewsEvent }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`h-8 w-8 rounded-full border-2 shadow-lg transition-all duration-200 hover:scale-110 ${
            event.sentiment === "positive"
              ? "border-emerald-500 bg-emerald-950/70 text-emerald-400 hover:bg-emerald-900/90"
              : event.sentiment === "negative"
              ? "border-rose-500 bg-rose-950/70 text-rose-400 hover:bg-rose-900/90"
              : "border-blue-500 bg-blue-950/70 text-blue-400 hover:bg-blue-900/90"
          }`}
        >
          <Info className="h-4 w-4" />
          <span className="sr-only">News event</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 overflow-hidden bg-slate-900 border-slate-800 text-slate-200"
        sideOffset={5}
      >
        <div
          className={`p-1 text-xs ${
            event.sentiment === "positive"
              ? "bg-emerald-900 text-emerald-100"
              : event.sentiment === "negative"
              ? "bg-rose-900 text-rose-100"
              : "bg-blue-900 text-blue-100"
          }`}
        >
          {event.source} • {format(parseISO(event.date), "MMM d, yyyy")}
        </div>
        <div className="space-y-2 p-4">
          <h4 className="font-medium text-base">{event.title}</h4>
          <p className="text-sm text-slate-400">{event.content}</p>
          <div className="flex items-center justify-between text-xs pt-2">
            <Badge variant="outline" className="font-normal">
              Impact: {event.impact}/10
            </Badge>
            <Badge
              variant={
                event.sentiment === "positive"
                  ? "outline"
                  : event.sentiment === "negative"
                  ? "destructive"
                  : "outline"
              }
              className={`font-medium ${
                event.sentiment === "positive"
                  ? "border-emerald-500 text-emerald-400"
                  : event.sentiment === "neutral"
                  ? "border-blue-500 text-blue-400"
                  : ""
              }`}
            >
              {event.sentiment.charAt(0).toUpperCase() +
                event.sentiment.slice(1)}
            </Badge>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Custom legend for currencies
const CurrencyLegend = ({
  currencies,
  visibleCurrencies,
  toggleCurrency,
}: {
  currencies: string[];
  visibleCurrencies: string[];
  toggleCurrency: (currency: string) => void;
}) => {
  return (
    <div className="flex flex-wrap gap-3 mt-2">
      {currencies.map((currency) => (
        <div
          key={currency}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
            visibleCurrencies.includes(currency)
              ? "bg-slate-800 hover:bg-slate-700"
              : "bg-slate-900/50 hover:bg-slate-800/50 opacity-60"
          }`}
          onClick={() => toggleCurrency(currency)}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getCurrencyColor(currency) }}
          />
          <span className="font-medium text-sm">{currency}</span>
          {visibleCurrencies.includes(currency) ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <X className="h-3.5 w-3.5 text-slate-400" />
          )}
        </div>
      ))}
    </div>
  );
};

export default function CurrencyChart({
  data,
  newsEvents = [],
  title = "Currency Performance",
  description = "Price chart with overlaid news events",
  defaultCurrencies = [],
  defaultTimeframe = "1M",
}: CurrencyChartProps) {
  // Remove the isDarkMode state and related code, replace with a constant:
  // Remove these lines:
  // ...
  // And the toggleDarkMode function

  // Add this constant at the top of the component:
  const isDarkMode = true;
  const [activeTimeframe, setActiveTimeframe] = useState(defaultTimeframe);
  const [mounted, setMounted] = useState(false);

  // Get all available currencies from the data
  const availableCurrencies = useMemo(() => {
    const firstDate = Object.keys(data)[0];
    if (!firstDate) return [];
    return data[firstDate]?.currencies.map((c) => c.symbol) || [];
  }, [data]);

  // Set visible currencies with defaults or all if none provided
  const [visibleCurrencies, setVisibleCurrencies] = useState<string[]>(
    defaultCurrencies.filter((c) => availableCurrencies.includes(c))
  );

  // Replace the entire processedData useMemo with this updated version:
  const processedData = useMemo(() => {
    return Object.entries(data)
      .map(([date, dayData]) => {
        // Create an object with date
        const result: Record<string, any> = { date };

        // Add each currency's price directly as a property
        dayData.currencies.forEach((currency) => {
          result[currency.symbol] = currency.price;
          // Store the full currency data for tooltip access
          result[`${currency.symbol}_data`] = {
            price: currency.price,
            change_1d: currency.change_1d,
            change_7d: currency.change_7d,
          };
        });

        // Check if there's a news event for this date
        result.hasNews = newsEvents.some((event) => event.date === date);

        return result;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data, newsEvents]);

  // Toggle currency visibility
  const toggleCurrency = (currency: string) => {
    setVisibleCurrencies((prev) =>
      prev.includes(currency)
        ? prev.filter((c) => c !== currency)
        : [...prev, currency]
    );
  };

  // Update the useEffect to always set dark mode:
  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.add("dark");
  }, []);

  // Only render content after mounting to avoid hydration mismatch
  if (!mounted) {
    return <div className="w-full h-[600px] bg-background animate-pulse"></div>;
  }

  // Format date for display
  const formatDate = (timestamp: string) => {
    return format(new Date(timestamp), "MMM d");
  };

  // Update the calculate min and max for better axis scaling:
  // Calculate min and max for better axis scaling across all visible currencies
  const allPrices = processedData.flatMap((d) =>
    visibleCurrencies
      .filter((currency) => d[currency] !== undefined)
      .map((currency) => d[currency])
  );

  const minPrice = Math.floor(Math.min(...allPrices) * 0.98) || 0;
  const maxPrice = Math.ceil(Math.max(...allPrices) * 1.02) || 100;

  // Update the Card component to always use dark theme:
  return (
    <Card className="w-full border-0 bg-slate-950 text-slate-200 shadow-xl shadow-slate-900/20">
      <CardHeader className="pb-2">
        <CurrencyLegend
          currencies={availableCurrencies}
          visibleCurrencies={visibleCurrencies}
          toggleCurrency={toggleCurrency}
        />
      </CardHeader>
      <CardContent>
        <div className="h-[450px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDarkMode ? "#334155" : "#e2e8f0"}
                opacity={0.4}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{
                  fontSize: 12,
                  fill: isDarkMode ? "#94a3b8" : "#64748b",
                }}
                tickCount={7}
                type="category"
                stroke={isDarkMode ? "#334155" : "#e2e8f0"}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                tick={{
                  fontSize: 12,
                  fill: isDarkMode ? "#94a3b8" : "#64748b",
                }}
                tickFormatter={(value) => `$${value}`}
                stroke={isDarkMode ? "#334155" : "#e2e8f0"}
                width={60}
              />
              <RechartsTooltip
                content={
                  <CustomTooltip visibleCurrencies={visibleCurrencies} />
                }
                cursor={{
                  stroke: isDarkMode ? "#475569" : "#94a3b8",
                  strokeWidth: 1,
                }}
              />

              {/* Update the chart rendering to fix the lines: */}
              {/* In the ComposedChart section, update the Line components: */}
              {/* Render a line for each visible currency */}
              {visibleCurrencies.map((currency) => (
                <Line
                  key={currency}
                  type="monotone"
                  dataKey={currency}
                  name={currency}
                  stroke={getCurrencyColor(currency)}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 6,
                    stroke: "#0f172a",
                    strokeWidth: 2,
                    fill: getCurrencyColor(currency),
                  }}
                  connectNulls={true}
                />
              ))}

              {/* Reference lines for news events */}
              {newsEvents.map((event, index) => (
                <ReferenceLine
                  key={`ref-line-${index}`}
                  x={event.date}
                  stroke={isDarkMode ? "#475569" : "#cbd5e1"}
                  strokeDasharray="3 3"
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>

          {/* News event markers directly on the chart */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Update the news event markers to use the simplified NewsBubble: */}
            {newsEvents.map((event, index) => {
              // Find the corresponding data point
              const dataPointIndex = processedData.findIndex(
                (d) => d.date === event.date
              );
              if (dataPointIndex === -1) return null;

              // Calculate position based on index
              const xPercent =
                (dataPointIndex / (processedData.length - 1)) * 100;

              return (
                <div
                  key={`chart-news-${index}`}
                  className="absolute pointer-events-auto"
                  style={{
                    left: `${xPercent}%`,
                    bottom: "0px",
                    transform: "translateX(-50%)",
                  }}
                >
                  <NewsBubble event={event} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        {/* Update the news event legend to always use dark theme: */}
        {newsEvents.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border-2 border-emerald-500 bg-emerald-950"></div>
              <span>Positive News</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border-2 border-rose-500 bg-rose-950"></div>
              <span>Negative News</span>
            </div>
            {newsEvents.some((e) => e.sentiment === "neutral") && (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full border-2 border-blue-500 bg-blue-950"></div>
                <span>Neutral News</span>
              </div>
            )}
          </div>
        )}

        {/* Current stats grid */}
        {processedData.length > 0 && visibleCurrencies.length > 0 && (
          // Update the stats grid to always use dark theme:
          <div className="mt-6 grid grid-rows-3 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-slate-300">
            {visibleCurrencies.map((currency) => {
              const latestData =
                processedData[processedData.length - 1][`${currency}_data`];
              if (!latestData) return null;

              return (
                <div
                  key={`stats-${currency}`}
                  className="p-4 rounded-lg bg-slate-900 border-l-4"
                  style={{ borderLeftColor: getCurrencyColor(currency) }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {currency}
                    </div>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getCurrencyColor(currency) }}
                    />
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    ${latestData.price.toFixed(2)}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <div
                      className={`flex items-center ${
                        latestData.change_1d > 0
                          ? "text-emerald-500"
                          : latestData.change_1d < 0
                          ? "text-rose-500"
                          : ""
                      }`}
                    >
                      {latestData.change_1d > 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : latestData.change_1d < 0 ? (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      ) : null}
                      {latestData.change_1d > 0 ? "+" : ""}
                      {latestData.change_1d.toFixed(2)}% (24h)
                    </div>
                    <div
                      className={`flex items-center ${
                        latestData.change_7d > 0
                          ? "text-emerald-500"
                          : latestData.change_7d < 0
                          ? "text-rose-500"
                          : ""
                      }`}
                    >
                      {latestData.change_7d > 0 ? "+" : ""}
                      {latestData.change_7d.toFixed(2)}% (7d)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
