import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const generatedId = React.useId();
    const radioId = id || generatedId;

    return (
      <label
        htmlFor={radioId}
        className={cn(
          "inline-flex items-start gap-3 select-none cursor-pointer group text-right",
          props.disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            type="radio"
            id={radioId}
            ref={ref}
            className="peer sr-only"
            {...props}
          />
          <div className="h-5 w-5 rounded-full border border-input bg-surface transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1 peer-checked:border-primary" />
          <div className="pointer-events-none absolute h-2.5 w-2.5 rounded-full bg-primary opacity-0 transition-opacity peer-checked:opacity-100" />
        </div>
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
      </label>
    );
  }
);

Radio.displayName = "Radio";

export { Radio };
