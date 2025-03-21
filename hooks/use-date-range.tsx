import { useState, useEffect, useCallback } from "react";
import { format, subDays, isAfter, isValid, parseISO } from "date-fns";

interface DateRangeOptions {
  defaultDays?: number;
  initialDateFrom?: string | null;
  initialDateTo?: string | null;
  onDateChange?: (dateFrom: string, dateTo: string) => void;
}

export function useDateRange({
  defaultDays = 7,
  initialDateFrom = null,
  initialDateTo = null,
  onDateChange,
}: DateRangeOptions = {}) {
  const today = new Date();
  const defaultStartDate = subDays(today, defaultDays);

  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0]; // Extract YYYY-MM-DD
  };

  const [dateFrom, setDateFrom] = useState<string>(
    initialDateFrom || formatDate(defaultStartDate)
  );
  const [dateTo, setDateTo] = useState<string>(
    initialDateTo || formatDate(today)
  );

  const validateDateRange = useCallback(
    (from: string, to: string) => {
      const today = format(new Date(), "yyyy-MM-dd");
      const defaultStartDate = format(
        subDays(new Date(), defaultDays),
        "yyyy-MM-dd"
      );

      const isValidDate = (dateStr: string) => {
        const parsedDate = parseISO(dateStr);
        return isValid(parsedDate);
      };

      const isNotFutureDate = (dateStr: string) => {
        const parsedDate = parseISO(dateStr);
        const todayDate = new Date();
        return !isAfter(parsedDate, todayDate);
      };

      // Validate dates
      let validFrom = isValidDate(from) && isNotFutureDate(from) ? from : null;
      let validTo = isValidDate(to) && isNotFutureDate(to) ? to : null;

      // Ensure dateFrom is not later than dateTo
      if (validFrom && validTo && new Date(validFrom) > new Date(validTo)) {
        validFrom = null;
        validTo = null;
      }

      // Default to default days ago if dateFrom is invalid or in the future
      if (!validFrom || new Date(validFrom) > new Date(today)) {
        validFrom = defaultStartDate;
      }

      // Default to today if dateTo is invalid or in the future
      if (!validTo || new Date(validTo) > new Date(today)) {
        validTo = today;
      }

      // Ensure that dateFrom is not after dateTo
      if (new Date(validFrom) > new Date(validTo)) {
        validFrom = validTo;
      }

      return { validFrom, validTo };
    },
    [defaultDays]
  );

  const updateDateRange = useCallback(
    (from: string, to: string) => {
      const { validFrom, validTo } = validateDateRange(from, to);

      if (validFrom !== dateFrom) {
        setDateFrom(validFrom);
      }

      if (validTo !== dateTo) {
        setDateTo(validTo);
      }

      if (onDateChange && (validFrom !== dateFrom || validTo !== dateTo)) {
        onDateChange(validFrom, validTo);
      }
    },
    [dateFrom, dateTo, validateDateRange, onDateChange]
  );

  // Update the date range if initial values change
  useEffect(() => {
    updateDateRange(initialDateFrom || dateFrom, initialDateTo || dateTo);
  }, [initialDateFrom, initialDateTo]);

  return {
    dateFrom,
    dateTo,
    setDateFrom: (newDateFrom: string) => updateDateRange(newDateFrom, dateTo),
    setDateTo: (newDateTo: string) => updateDateRange(dateFrom, newDateTo),
    formatDate,
  };
}
