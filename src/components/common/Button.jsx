import { Slot } from "./Slot.jsx";
import { buttonVariants } from "./buttonVariants.js";
import { cn } from "../../lib/utils.js";

export function Button({
  asChild = false,
  className,
  size,
  variant,
  ...props
}) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      className={cn(buttonVariants({ size, variant }), className)}
      {...props}
    />
  );
}
