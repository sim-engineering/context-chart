import { useState, useEffect, useRef } from "react";

interface TickerSelectionOptions {
  initialSelection?: string[];
  onSelectionChange?: (selected: string[]) => void;
}

export function useTickerSelection({
  initialSelection = [],
  onSelectionChange,
}: TickerSelectionOptions = {}) {
  const [selected, setSelected] = useState<string[]>(initialSelection);
  const initialSelectionRef = useRef<string[]>(initialSelection);

  // Use a deep comparison to check if arrays have changed
  const arraysAreEqual = (a1: string[], a2: string[]): boolean => {
    if (a1.length !== a2.length) return false;
    const sortedA1 = [...a1].sort();
    const sortedA2 = [...a2].sort();
    return sortedA1.every((val, idx) => val === sortedA2[idx]);
  };

  const toggleSelection = (ticker: string) => {
    setSelected((prev) => {
      const newSelection = prev.includes(ticker)
        ? prev.filter((item) => item !== ticker)
        : [...prev, ticker];

      if (onSelectionChange) {
        onSelectionChange(newSelection);
      }

      return newSelection;
    });
  };

  // Only update if the initialSelection actually changes in a meaningful way
  useEffect(() => {
    if (
      initialSelection &&
      !arraysAreEqual(initialSelection, initialSelectionRef.current)
    ) {
      initialSelectionRef.current = initialSelection;
      setSelected(initialSelection);
    }
  }, [initialSelection]);

  return { selected, toggleSelection, setSelected };
}
