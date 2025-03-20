"use client";

import React, { useState, useEffect, useCallback } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { format, parseISO, differenceInDays, addDays } from "date-fns";

const DateSlider = ({
  minDate,
  maxDate,
  onDateChange,
}: {
  minDate: string;
  maxDate: string;
  onDateChange: (date: string) => void;
}) => {
  const min = parseISO(minDate);
  const max = parseISO(maxDate);

  const totalDays = differenceInDays(max, min);

  const [sliderValue, setSliderValue] = useState(totalDays);
  const [debouncedValue, setDebouncedValue] = useState(totalDays);

  const getDateFromSlider = (daysOffset: number): string => {
    return format(addDays(min, daysOffset), "yyyy-MM-dd");
  };

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value[0]);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(sliderValue);
      onDateChange(getDateFromSlider(sliderValue));
    }, 300);

    return () => clearTimeout(handler);
  }, [sliderValue]);

  return (
    <div className="relative w-full pt-8">
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center"
        value={[sliderValue]}
        min={0}
        max={totalDays}
        step={1}
        onValueChange={handleSliderChange}
      >
        <SliderPrimitive.Track className="relative h-2 w-full bg-gray-300 rounded-full">
          <SliderPrimitive.Range className="absolute h-full bg-blue-500" />
        </SliderPrimitive.Track>

        <SliderPrimitive.Thumb className="block h-5 w-5 bg-blue-500 rounded-full border-2 border-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </SliderPrimitive.Root>

      <div
        className="absolute bottom-6 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md shadow-md"
        style={{
          left: `calc(${(sliderValue / totalDays) * 100}%)`,
          transform: "translateX(-50%)",
        }}
      >
        {getDateFromSlider(debouncedValue)}
      </div>
    </div>
  );
};

export default DateSlider;
