"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { format } from "date-fns"; // Import date-fns to format the date
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, value, onValueChange, ...props }, ref) => {
  const [sliderValue, setSliderValue] = React.useState(value ? value[0] : 0);

  const getDateFromDays = (days: number): string => {
    const baseDate = new Date(); // Start from today
    baseDate.setDate(baseDate.getDate() + days); // Add the days
    return format(baseDate, "yyyy-MM-dd"); // Format the date
  };

  const handleValueChange = (value: number[]) => {
    const newValue = value[0];
    setSliderValue(newValue);
    onValueChange && onValueChange(value);
  };

  return (
    <div className="relative pt-10">
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
        dir="rtl"
        value={[sliderValue]}
        onValueChange={handleValueChange}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>

      <div
        className="absolute bottom-6 mt-0 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-lg shadow-md transform -translate-x-1/2 backdrop-blur-sm border border-white/10 transition-all duration-200"
        style={{
          right: `calc(${(sliderValue / 365) * 100}%)`,
          left: "auto",
          transform: "translateX(50%)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
            <line x1="16" x2="16" y1="2" y2="6"></line>
            <line x1="8" x2="8" y1="2" y2="6"></line>
            <line x1="3" x2="21" y1="10" y2="10"></line>
          </svg>
          {getDateFromDays(365 - sliderValue)}
        </div>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-indigo-500 rotate-45"></div>
      </div>
    </div>
  );
});

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
