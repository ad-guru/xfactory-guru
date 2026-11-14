import { forwardRef } from "react";
import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "sm" | "icon";
};

const variants = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover border border-transparent",
  secondary: "bg-surface text-ink border border-border hover:bg-surface-muted",
  ghost: "bg-transparent text-ink border border-transparent hover:bg-surface-muted",
  danger: "bg-error text-on-primary border border-transparent hover:opacity-90",
};

const sizes = {
  md: "h-8 px-3 text-[14px] gap-1.5",
  sm: "h-7 px-2 text-[12px] gap-1",
  icon: "h-8 w-8 justify-center",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", className, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={clsx(
        "inline-flex items-center rounded-md font-medium transition-colors cursor-pointer",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    />
  );
});
