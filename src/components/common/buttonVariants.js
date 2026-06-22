import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/88",
        secondary:
          "border border-border bg-secondary text-secondary-foreground hover:bg-secondary/82",
        ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);
