import clsx from "clsx";

export function Card({ className, ...rest }: React.HTMLAttributes<HTMLElement>) {
  return <section className={clsx("bg-surface border border-border rounded-md", className)} {...rest} />;
}

export function CardHeader(props: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border">
      <div className="min-w-0">
        <h2 className="text-[16px] leading-6 font-medium">{props.title}</h2>
        {props.subtitle && <p className="text-[12px] text-ink-muted">{props.subtitle}</p>}
      </div>
      {props.actions && <div className="ml-auto flex items-center gap-2">{props.actions}</div>}
    </div>
  );
}
