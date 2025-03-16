type CurrencyCardProps = {
  currencyData: Asset;
  size: "lg" | "small";
};
const CURRENCY_SYMBOLS = {
  "USD/SAR": "ر.س",
  "USD/CAD": "$",
  "USD/AUD": "$",
  "USD/JPY": "¥",
  "USD/GBP": "£",
  "USD/CNY": "¥",
  "USD/THB": "฿",
  "USD/ZAR": "Z",
  "USD/EUR": "€",
};
const CurrencyCard = ({ currencyData, size }: CurrencyCardProps) => {
  const { symbol, price, change } = currencyData;

  const changeColor = change > 0 ? "text-green-500" : "text-red-500";

  const sizeClasses = size === "lg" ? "w-44 p-2" : "w-36 p-1";
  const textSize = size === "lg" ? "text-sm" : "text-xs";
  const fontSize = size === "lg" ? "font-medium" : "font-semibold";

  return (
    <div
      className={`flex items-center justify-between rounded-lg shadow-md bg-gray-800 ${sizeClasses}`}
    >
      <div className="flex flex-col items-start">
        <span className={`text-white ${textSize} ${fontSize} font-normal`}>
          {symbol}
        </span>
        <span className={`text-white ${textSize} font-mono`}>
          {CURRENCY_SYMBOLS[symbol]}
          {price.toFixed(2)}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <div className="flex flex-col justify-between h-full items-end">
          <span
            className={`w-2 h-2 rounded-full ${
              change > 0 ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <div className="h-3"></div>
          <span className={`${textSize} ${changeColor} font-mono`}>
            {change.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default CurrencyCard;
