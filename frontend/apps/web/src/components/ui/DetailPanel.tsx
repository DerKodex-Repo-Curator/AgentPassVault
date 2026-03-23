import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type DetailPanelTone = "requests" | "secrets" | "agents";

interface DetailPanelProps extends HTMLAttributes<HTMLDivElement> {
  tone: DetailPanelTone;
  eyebrow: string;
  heading: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

interface DetailPanelSectionProps extends HTMLAttributes<HTMLElement> {
  heading: string;
  children: ReactNode;
}

function toneAccentClass(tone: DetailPanelTone) {
  if (tone === "requests") {
    return "bg-[var(--color-domain-requests-strong)] text-[var(--color-domain-requests-text)]";
  }

  if (tone === "secrets") {
    return "bg-[var(--color-domain-secrets-strong)] text-[var(--color-domain-secrets-text)]";
  }

  return "bg-[var(--color-domain-agents-strong)] text-[var(--color-domain-agents-text)]";
}

export function DetailPanel({
  tone,
  eyebrow,
  heading,
  description,
  actions,
  className,
  children,
  ...props
}: DetailPanelProps) {
  return (
    <aside
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] shadow-[var(--color-shadow)]",
        className,
      )}
      {...props}
    >
      <div
        className={cn("absolute inset-y-0 left-0 w-1", toneAccentClass(tone))}
      />

      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-subtle)]">
              {eyebrow}
            </p>
            <div className="mt-2 text-[var(--color-text)]">{heading}</div>
            {description ? (
              <div className="mt-2 text-sm text-[var(--color-text-muted)]">
                {description}
              </div>
            ) : null}
          </div>
          {actions}
        </div>
      </header>

      <div className="px-5">{children}</div>
    </aside>
  );
}

export function DetailPanelSection({
  heading,
  className,
  children,
  ...props
}: DetailPanelSectionProps) {
  return (
    <section
      className={cn(
        "border-t border-[var(--color-border)] py-5 first:border-t-0",
        className,
      )}
      {...props}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-subtle)]">
        {heading}
      </p>
      <div className="mt-2">{children}</div>
    </section>
  );
}
