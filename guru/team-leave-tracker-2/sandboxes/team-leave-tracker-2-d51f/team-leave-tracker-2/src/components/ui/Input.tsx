import { forwardRef } from "react";
import clsx from "clsx";

export const inputClass =
  "h-8 w-full rounded-md border border-border-strong bg-surface px-2.5 text-[14px] text-ink placeholder:text-ink-faint";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={clsx(inputClass, rest["aria-invalid"] && "border-error", className)}
        {...rest}
      />
    );
  },
);

export function Field(props: {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={props.id} className="text-[12px] font-medium text-ink-muted">
        {props.label}
        {props.optional && <span className="font-normal text-ink-faint"> (optional)</span>}
      </label>
      {props.children}
      {props.error && (
        <p id={`${props.id}-error`} role="alert" className="text-[12px] text-error">
          {props.error}
        </p>
      )}
    </div>
  );
}
