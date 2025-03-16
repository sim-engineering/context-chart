"use client";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils"; // Assuming this is a utility for conditional class names

const spinnerVariants = cva(
  "inline-block rounded-full border-t-4 border-solid animate-spin",
  {
    variants: {
      size: {
        sm: "w-4 h-4 border-t-2", // Small spinner
        md: "w-8 h-8 border-t-4", // Medium spinner
        lg: "w-12 h-12 border-t-6", // Large spinner
      },
      color: {
        primary: "border-t-blue-500",
        secondary: "border-t-green-500",
        danger: "border-t-red-500",
      },
    },
    defaultVariants: {
      size: "md", // Default size
      color: "primary", // Default color
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

function Spinner({ className, size, color, ...props }: SpinnerProps) {
  return (
    <div
      className={cn(spinnerVariants({ size, color }), className)}
      {...props}
    />
  );
}

export { Spinner, spinnerVariants };
