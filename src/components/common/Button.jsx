import { forwardRef } from "react";
import { Slot } from "./Slot.jsx";
import { buttonVariants } from "./buttonVariants.js";
import { cn } from "../../lib/utils.js";

export const Button = forwardRef(function Button(
  { asChild = false, className, size, variant, ...props },
  ref,
) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      className={cn(buttonVariants({ size, variant }), className)}
      ref={ref}
      {...props}
    />
  );
});
