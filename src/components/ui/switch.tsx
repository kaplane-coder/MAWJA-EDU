import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, checked, ...props }, ref) => {
    const generatedId = React.useId();
    const switchId = id || generatedId;

    return (
      <label
        htmlFor={switchId}
        className={cn(
          "inline-flex items-center justify-between gap-4 select-none cursor-pointer group text-right",
          props.disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <span className="block text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {label}
              </span>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 bg-muted peer-checked:bg-primary">
          <input
            type="checkbox"
            id={switchId}
            ref={ref}
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow-md ring-0 transition duration-200 ease-in-out",
              checked ? "-translate-x-5 bg-primary" : "translate-x-0"
            )}
          />
        </div>
      </label>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
