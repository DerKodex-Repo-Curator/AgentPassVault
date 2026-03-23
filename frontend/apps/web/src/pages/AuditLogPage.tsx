import { useMemo, useState } from "react";
import { Badge, Card, Input, Tabs, type TabItem } from "../components/ui";
import { formatDateTime } from "../mockup/format";
import { mockupAuditEvents } from "../mockup/lofi-data";

type AuditFilter = "all" | "requests" | "secrets" | "agents";

const FILTER_TABS: TabItem[] = [
  { id: "all", label: "All" },
  { id: "requests", label: "Requests" },
  { id: "secrets", label: "Secrets" },
  { id: "agents", label: "Agents" },
];

function outcomeTone(outcome: "success" | "warning" | "danger" | "neutral") {
  if (outcome === "success") {
    return "success" as const;
  }

  if (outcome === "warning") {
    return "warning" as const;
  }

  if (outcome === "danger") {
    return "danger" as const;
  }

  return "neutral" as const;
}

export function AuditLogPage() {
  const [filter, setFilter] = useState<AuditFilter>("all");
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return mockupAuditEvents.filter((event) => {
      const matchesFilter =
        filter === "all" ? true : event.domain.toLowerCase() === filter;
      const matchesQuery =
        !normalizedQuery ||
        event.actor.toLowerCase().includes(normalizedQuery) ||
        event.action.toLowerCase().includes(normalizedQuery) ||
        event.target.toLowerCase().includes(normalizedQuery) ||
        event.detail.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  return (
    <section className="space-y-4">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-subtle)]">
            Audit Log
          </p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-[var(--color-text)]">
            Reconstruct what happened without opening every event.
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--color-text-muted)]">
            Audit history stays compact and timeline-first so operators can
            understand sequence, actor, target, and impact at a glance.
          </p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-subtle)]">
            Visible events
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text)]">
            {items.length}
          </p>
        </div>
      </header>

      <Card
        title="Timeline"
        description="Audit Log remains a dense operational history rather than a dashboard."
        actions={
          <Tabs
            tabs={FILTER_TABS}
            activeId={filter}
            onChange={(next) => setFilter(next as AuditFilter)}
          />
        }
      >
        <div className="mb-4">
          <Input
            label="Search audit events"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by actor, action, target, or detail"
          />
        </div>

        <div className="space-y-2">
          {items.map((event) => (
            <div
              key={event.id}
              className="grid gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:grid-cols-[180px_minmax(0,1fr)]"
            >
              <div className="text-xs text-[var(--color-text-subtle)]">
                <p className="font-semibold uppercase tracking-[0.14em]">
                  {event.domain}
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--color-text)]">
                  {formatDateTime(event.at)}
                </p>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={outcomeTone(event.outcome)}>
                    {event.outcome}
                  </Badge>
                  <span className="text-sm font-semibold text-[var(--color-text)]">
                    {event.action}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--color-text)]">
                  <span className="font-medium">{event.actor}</span> acted on{" "}
                  <span className="font-medium">{event.target}</span>.
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {event.detail}
                </p>
              </div>
            </div>
          ))}

          {items.length === 0 ? (
            <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">
              No audit events match the current filter.
            </div>
          ) : null}
        </div>
      </Card>
    </section>
  );
}
