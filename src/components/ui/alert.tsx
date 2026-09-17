import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { WarningCircle, CheckCircle, Info, Warning } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 text-sm [&>svg~*]:pr-7 [&>svg]:absolute [&>svg]:right-4 [&>svg]:top-4 text-right transition-all",
  {
    variants: {
      variant: {
        default: "bg-surface border-border text-foreground [&>svg]:text-foreground",
        success:
          "bg-success-subtle border-success/30 text-success-foreground [&>svg]:text-success",
        warning:
          "bg-warning-subtle border-warning/30 text-warning-foreground [&>svg]:text-warning",
        error:
          "bg-error-subtle border-error/30 text-error-foreground [&>svg]:text-error",
        info: "bg-info-subtle border-info/30 text-info-foreground [&>svg]:text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const alertIcons = {
  default: Info,
  success: CheckCircle,
  warning: Warning,
  error: WarningCircle,
  info: Info,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  icon?: boolean;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", title, children, icon = true, ...props }, ref) => {
    const IconComponent = alertIcons[variant || "default"];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {icon && <IconComponent className="h-5 w-5 shrink-0" />}
        <div className="space-y-1">
          {title && (
            <h5 className="font-semibold leading-tight tracking-tight text-foreground">
              {title}
            </h5>
          )}
          <div className="text-sm leading-relaxed opacity-90">{children}</div>
        </div>
      </div>
    );
  }
);
Alert.displayName = "Alert";

export { Alert, alertVariants };
