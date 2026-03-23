import { useEffect, useMemo, useState } from "react";
import type { SecretDetailsResponse, MasterKeys } from "@agentpassvault/sdk";
import { appApiClient } from "../api/client";
import { Badge, Button, Card, Input, Toast } from "../components/ui";
import { readAppEnv } from "../config/env";
import { formatDateTime, formatRelativeLabel } from "../mockup/format";
import { type MockupSecret, mockupSecrets } from "../mockup/lofi-data";
import { useSessionStore } from "../state/session-store";

interface SecretsPageProps {
  isVaultLocked: boolean;
  masterKeys: MasterKeys | null;
  onOpenSecret: (secretId: string) => void;
}

function normalizeMetadata(
  metadata: SecretDetailsResponse["metadata"],
): Record<string, string> {
  if (!metadata) {
    return {};
  }

  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === "string") {
      normalized[key] = value;
      continue;
    }

    if (value && typeof value === "object" && "value" in value) {
      normalized[key] =
        typeof value.value === "string"
          ? value.value
          : JSON.stringify(value.value);
      continue;
    }

    normalized[key] = JSON.stringify(value);
  }

  return normalized;
}

function mapSecret(secret: SecretDetailsResponse): MockupSecret {
  const metadata = normalizeMetadata(secret.metadata);

  return {
    id: secret.secretId ?? `secret-${Math.random().toString(36).slice(2)}`,
    name: secret.name ?? "Unnamed secret",
    service: metadata.service ?? "unknown",
    environment: metadata.environment ?? "shared",
    owner: metadata.owner ?? "Unknown owner",
    updatedAt: secret.updatedAt
      ? new Date(secret.updatedAt).toISOString()
      : new Date().toISOString(),
    revealedValue: "Reveal is available in mocked mode for the lo-fi preview.",
    metadata,
    leaseCount: 0,
    activeAgents: [],
    note: "Live mode only exposes list metadata in the current mockup branch.",
  };
}

export function SecretsPage({
  isVaultLocked,
  masterKeys,
  onOpenSecret,
}: SecretsPageProps) {
  const env = readAppEnv();
  const { accessToken } = useSessionStore();
  const [secrets, setSecrets] = useState<MockupSecret[]>(
    env.apiMockingEnabled ? mockupSecrets : [],
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    mockupSecrets[0]?.id ?? null,
  );
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(!env.apiMockingEnabled);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (env.apiMockingEnabled) {
      setSecrets(mockupSecrets);
      setSelectedId(mockupSecrets[0]?.id ?? null);
      setLoading(false);
      return;
    }

    let active = true;
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      const result = await appApiClient.listSecrets();
      if (!active) {
        return;
      }

      if (!result.ok) {
        setLoading(false);
        setError(result.error.message);
        return;
      }

      const mapped = result.data.map((secret) => mapSecret(secret));
      setSecrets(mapped);
      setSelectedId(mapped[0]?.id ?? null);
      setLoading(false);
    };

    void load();
    return () => {
      active = false;
    };
  }, [accessToken, env.apiMockingEnabled]);

  useEffect(() => {
    if (isVaultLocked) {
      setRevealedIds({});
    }
  }, [isVaultLocked]);

  const filteredSecrets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return secrets.filter((secret) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        secret.name.toLowerCase().includes(normalizedQuery) ||
        secret.service.toLowerCase().includes(normalizedQuery) ||
        secret.environment.toLowerCase().includes(normalizedQuery) ||
        secret.owner.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, secrets]);

  useEffect(() => {
    if (!filteredSecrets.some((secret) => secret.id === selectedId)) {
      setSelectedId(filteredSecrets[0]?.id ?? null);
    }
  }, [filteredSecrets, selectedId]);

  const selectedSecret =
    filteredSecrets.find((secret) => secret.id === selectedId) ??
    filteredSecrets[0] ??
    null;

  const toggleReveal = (secretId: string) => {
    if (isVaultLocked || !masterKeys) {
      setNotice("Vault is locked. Unlock before revealing secret values.");
      return;
    }

    setNotice(null);
    setRevealedIds((current) => ({
      ...current,
      [secretId]: !current[secretId],
    }));
  };

  if (loading) {
    return <Toast title="Secrets">Loading secrets...</Toast>;
  }

  return (
    <section className="space-y-4">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-domain-secrets-text)]">
            Secrets
          </p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-[var(--color-text)]">
            Inspect protected assets without losing operational context.
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--color-text-muted)]">
            Secret values can be inspected quickly, while metadata, lease
            exposure, and ownership stay visible in the detail pane.
          </p>
        </div>
        <div className="rounded-[16px] border border-[var(--color-domain-secrets-border)] bg-[var(--color-domain-secrets-soft)] px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-domain-secrets-text)]">
            Stored secrets
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-domain-secrets-text)]">
            {secrets.length}
          </p>
        </div>
      </header>

      {notice ? (
        <Toast title="Secrets" onDismiss={() => setNotice(null)}>
          {notice}
        </Toast>
      ) : null}
      {error ? (
        <Toast tone="error" title="Secrets">
          {error}
        </Toast>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
        <Card
          title="Catalog"
          description="Quick reveal is available directly in the list."
          className="min-h-[720px]"
        >
          <div className="mb-4">
            <Input
              label="Search secrets"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by secret, service, owner, or environment"
            />
          </div>

          <div className="space-y-2">
            {filteredSecrets.map((secret) => {
              const isSelected = secret.id === selectedSecret?.id;
              const isRevealed = Boolean(revealedIds[secret.id]);

              return (
                <div
                  key={secret.id}
                  className={`rounded-[16px] border p-4 transition ${
                    isSelected
                      ? "border-[var(--color-domain-secrets-border)] bg-[var(--color-domain-secrets-soft)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => setSelectedId(secret.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Badge tone="neutral">{secret.service}</Badge>
                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-text-subtle)]">
                          {secret.environment}
                        </span>
                      </div>
                      <h2 className="mt-2 truncate text-sm font-semibold text-[var(--color-text)]">
                        {secret.name}
                      </h2>
                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        {secret.note}
                      </p>
                    </button>
                    <div className="text-right text-xs text-[var(--color-text-subtle)]">
                      <p>{formatRelativeLabel(secret.updatedAt)}</p>
                      <p className="mt-1">{formatDateTime(secret.updatedAt)}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="truncate text-xs text-[var(--color-text-muted)]">
                      Owner: {secret.owner}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleReveal(secret.id)}
                      className="text-xs font-semibold text-[var(--color-primary)]"
                    >
                      {isRevealed ? "Hide" : "Reveal"}
                    </button>
                  </div>

                  {isRevealed ? (
                    <pre className="mt-3 overflow-x-auto rounded-[12px] bg-[var(--color-surface-subtle)] p-3 text-xs leading-6 text-[var(--color-text)]">
                      {secret.revealedValue}
                    </pre>
                  ) : null}
                </div>
              );
            })}

            {filteredSecrets.length === 0 ? (
              <div className="rounded-[16px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">
                No secrets match the current query.
              </div>
            ) : null}
          </div>
        </Card>

        <div className="space-y-4">
          {selectedSecret ? (
            <>
              <Card
                title={selectedSecret.name}
                description={selectedSecret.note}
                actions={
                  <Badge tone="neutral">{selectedSecret.environment}</Badge>
                }
              >
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-subtle)]">
                      Service
                    </dt>
                    <dd className="mt-1 text-sm text-[var(--color-text)]">
                      {selectedSecret.service}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-subtle)]">
                      Owner
                    </dt>
                    <dd className="mt-1 text-sm text-[var(--color-text)]">
                      {selectedSecret.owner}
                    </dd>
                  </div>
                </dl>
              </Card>

              <Card
                title="Value preview"
                description="Quick reveal should feel lightweight, not theatrical."
              >
                <pre className="overflow-x-auto rounded-[14px] bg-[var(--color-surface-subtle)] p-4 text-xs leading-6 text-[var(--color-text)]">
                  {revealedIds[selectedSecret.id]
                    ? selectedSecret.revealedValue
                    : "••••••••••••••••••••••••••••"}
                </pre>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => toggleReveal(selectedSecret.id)}
                  >
                    {revealedIds[selectedSecret.id]
                      ? "Hide value"
                      : "Reveal value"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onOpenSecret(selectedSecret.id)}
                  >
                    Open detail
                  </Button>
                </div>
              </Card>

              <Card
                title="Metadata"
                description="Raw metadata remains readable and exact."
              >
                <pre className="overflow-x-auto rounded-[14px] bg-[var(--color-surface-subtle)] p-4 text-xs leading-6 text-[var(--color-text)]">
                  {JSON.stringify(selectedSecret.metadata, null, 2)}
                </pre>
              </Card>

              <Card
                title="Lease exposure"
                description="Which agents currently depend on this secret."
              >
                <dl className="grid gap-3 text-sm text-[var(--color-text)]">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-[var(--color-text-muted)]">
                      Active leases
                    </dt>
                    <dd>{selectedSecret.leaseCount}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-text-muted)]">
                      Active agents
                    </dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {selectedSecret.activeAgents.map((agent) => (
                        <span
                          key={agent}
                          className="rounded-full bg-[var(--color-surface-subtle)] px-3 py-1 text-xs font-medium text-[var(--color-text)]"
                        >
                          {agent}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>
              </Card>
            </>
          ) : (
            <Card
              title="No secret selected"
              description="Choose a secret from the catalog to inspect it."
            >
              <p className="text-sm text-[var(--color-text-muted)]">
                The detail pane will remain empty until a visible secret is
                selected.
              </p>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
