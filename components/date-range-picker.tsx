import * as React from "react";
import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  className?: string;
  initialDateFrom?: string;
  initialDateTo?: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
}

export function DateRangePicker({
  className,
  initialDateFrom,
  initialDateTo,
  onDateFromChange,
  onDateToChange,
}: DateRangePickerProps) {
  // Parse initial string dates to Date objects if provided
  const initialFrom = initialDateFrom
    ? parse(initialDateFrom, "yyyy-MM-dd", new Date())
    : undefined;

  const initialTo = initialDateTo
    ? parse(initialDateTo, "yyyy-MM-dd", new Date())
    : undefined;

  // Set up initial date range state
  const [date, setDate] = React.useState<DateRange | undefined>(
    initialFrom && initialTo ? { from: initialFrom, to: initialTo } : undefined
  );

  // Control the open state of the popover
  const [isOpen, setIsOpen] = React.useState(false);

  // Ref to track if selection flow is complete (both dates selected)
  const selectionComplete = React.useRef(false);

  // Get today's date
  const today = new Date();

  // Reset selection when opening the popover if we already have a complete selection
  React.useEffect(() => {
    if (isOpen && date?.from && date?.to) {
      // Clear the existing selection when reopening
      setDate(undefined);
    }
  }, [isOpen]);

  const handleCalendarSelect = (selectedRange: DateRange | undefined) => {
    // Always update the current selection state
    setDate(selectedRange);

    // If no selection, nothing to do
    if (!selectedRange) return;

    // Update the from date if it exists
    if (selectedRange.from) {
      onDateFromChange(format(selectedRange.from, "yyyy-MM-dd"));
    }

    // Update the to date if it exists
    if (selectedRange.to) {
      onDateToChange(format(selectedRange.to, "yyyy-MM-dd"));
    }

    // Check if both dates are selected
    if (selectedRange.from && selectedRange.to) {
      selectionComplete.current = true;

      // Add a small delay before closing to give visual feedback
      setTimeout(() => {
        setIsOpen(false);
        // Reset the selection flag after closing
        selectionComplete.current = false;
      }, 300);
    }
  };

  // Handle popover open/close events
  const handleOpenChange = (open: boolean) => {
    // If trying to close but we haven't completed selection, prevent closing
    if (!open && !selectionComplete.current && date?.from && !date?.to) {
      return;
    }

    // Otherwise accept the open state change
    setIsOpen(open);
  };

  // Handle button click - always clear and open
  const handleButtonClick = () => {
    setIsOpen(true);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date?.from && !date?.to && "text-muted-foreground"
            )}
            onClick={handleButtonClick}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from && date?.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              <span>Select date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 dark"
          align="start"
          side="bottom"
          sideOffset={5}
          forceMount
          style={{
            zIndex: 9999,
            backgroundColor: "hsl(var(--popover))",
            color: "hsl(var(--popover-foreground))",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div
            className="calendar-container"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from || new Date()}
              selected={date}
              onSelect={handleCalendarSelect}
              numberOfMonths={2}
              className="dark border-none"
              classNames={{
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                day_range_middle:
                  "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground",
                day_range_end:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                day_range_start:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                day_today: "border border-primary",
              }}
              // Restrict the selectable date range to today
              footer={
                <div className="p-3 text-sm bg-background border-t">
                  <p className="font-medium">
                    {!date?.from && "Step 1: Select start date"}
                    {date?.from && !date?.to && "Step 2: Select end date"}
                    {date?.from && date?.to && "Date range selected"}
                  </p>
                </div>
              }
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
