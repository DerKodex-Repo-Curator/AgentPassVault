import { useEffect, useMemo, useState } from "react";
import type { AgentResponse } from "@agentpassvault/sdk";
import { appApiClient } from "../api/client";
import {
  Badge,
  Button,
  Card,
  DetailPanel,
  DetailPanelSection,
  Input,
  Modal,
  Toast,
} from "../components/ui";
import { readAppEnv } from "../config/env";
import { formatDateTime, formatRelativeLabel } from "../mockup/format";
import { type MockupAgent, mockupAgents } from "../mockup/lofi-data";
import { useSessionStore } from "../state/session-store";

function mapAgent(agent: AgentResponse): MockupAgent {
  const fingerprintSource = agent.publicKey ?? agent.agentId ?? "unknown";

  return {
    id: agent.agentId ?? `agent-${Math.random().toString(36).slice(2)}`,
    name: agent.name ?? agent.agentId ?? "Unnamed agent",
    displayName: agent.displayName ?? agent.name ?? "Unnamed agent",
    environment: "shared",
    publicKeyState: agent.publicKey
      ? "RSA-OAEP-4096 key present"
      : "No key registered",
    keyFingerprint: fingerprintSource.slice(0, 16),
    lastActivityAt: agent.createdAt
      ? new Date(agent.createdAt).toISOString()
      : new Date().toISOString(),
    activeLeases: 0,
    linkedSecrets: [],
    note: "Live mode exposes agent identity data only in the current mockup branch.",
    risk: agent.publicKey ? "stable" : "attention",
  };
}

export function AgentsPage() {
  const env = readAppEnv();
  const { accessToken } = useSessionStore();
  const [agents, setAgents] = useState<MockupAgent[]>(
    env.apiMockingEnabled ? mockupAgents : [],
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    mockupAgents[0]?.id ?? null,
  );
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(!env.apiMockingEnabled);
  const [error, setError] = useState<string | null>(null);
  const [revokeOpen, setRevokeOpen] = useState(false);

  useEffect(() => {
    if (env.apiMockingEnabled) {
      setAgents(mockupAgents);
      setSelectedId(mockupAgents[0]?.id ?? null);
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
      const result = await appApiClient.listAgents();
      if (!active) {
        return;
      }

      if (!result.ok) {
        setLoading(false);
        setError(result.error.message);
        return;
      }

      const mapped = result.data.map((agent) => mapAgent(agent));
      setAgents(mapped);
      setSelectedId(mapped[0]?.id ?? null);
      setLoading(false);
    };

    void load();
    return () => {
      active = false;
    };
  }, [accessToken, env.apiMockingEnabled]);

  const filteredAgents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return agents.filter((agent) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        agent.name.toLowerCase().includes(normalizedQuery) ||
        agent.displayName.toLowerCase().includes(normalizedQuery) ||
        agent.environment.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [agents, query]);

  useEffect(() => {
    if (!filteredAgents.some((agent) => agent.id === selectedId)) {
      setSelectedId(filteredAgents[0]?.id ?? null);
    }
  }, [filteredAgents, selectedId]);

  const selectedAgent =
    filteredAgents.find((agent) => agent.id === selectedId) ??
    filteredAgents[0] ??
    null;

  if (loading) {
    return <Toast title="Agents">Loading agents...</Toast>;
  }

  return (
    <section className="space-y-4">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-domain-agents-text)]">
            Agents
          </p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-[var(--color-text)]">
            Inspect machine identity, key posture, and lease exposure together.
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--color-text-muted)]">
            Agents stay in the primary navigation because registration state and
            lease dependency are daily operational concerns.
          </p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--color-domain-agents-border)] bg-[var(--color-domain-agents-soft)] px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-domain-agents-text)]">
            Registered agents
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-domain-agents-text)]">
            {agents.length}
          </p>
        </div>
      </header>

      {error ? (
        <Toast tone="error" title="Agents">
          {error}
        </Toast>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.95fr)]">
        <Card
          title="Inventory"
          description="Select an agent to inspect key registration and lease posture."
          className="min-h-[680px]"
        >
          <div className="mb-4">
            <Input
              label="Search agents"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by agent, display name, or environment"
            />
          </div>

          <div className="space-y-2">
            {filteredAgents.map((agent) => {
              const isSelected = agent.id === selectedAgent?.id;
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setSelectedId(agent.id)}
                  className={`w-full rounded-[var(--radius-card)] border p-4 text-left transition ${
                    isSelected
                      ? "border-[var(--color-domain-agents-border)] border-l-[3px] border-l-[var(--color-domain-agents-strong)] bg-[var(--color-domain-agents-soft)] shadow-sm"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge
                          tone={agent.risk === "stable" ? "success" : "warning"}
                        >
                          {agent.risk === "stable" ? "ready" : "attention"}
                        </Badge>
                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-text-subtle)]">
                          {agent.environment}
                        </span>
                      </div>
                      <h2 className="mt-2 truncate text-sm font-semibold text-[var(--color-text)]">
                        {agent.displayName}
                      </h2>
                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        {agent.publicKeyState}
                      </p>
                    </div>
                    <div className="text-right text-xs text-[var(--color-text-subtle)]">
                      <p>{formatRelativeLabel(agent.lastActivityAt)}</p>
                      <p className="mt-1">
                        {formatDateTime(agent.lastActivityAt)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="xl:pl-2">
          {selectedAgent ? (
            <DetailPanel
              tone="agents"
              eyebrow="Selected agent"
              heading={
                <h2 className="text-xl font-semibold tracking-[-0.02em]">
                  {selectedAgent.displayName}
                </h2>
              }
              description={selectedAgent.note}
              actions={
                <Badge
                  tone={selectedAgent.risk === "stable" ? "success" : "warning"}
                >
                  {selectedAgent.risk}
                </Badge>
              }
              className="min-h-[680px]"
            >
              <DetailPanelSection heading="Overview">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-subtle)]">
                      Agent ID
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text)]">
                      {selectedAgent.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-subtle)]">
                      Environment
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text)]">
                      {selectedAgent.environment}
                    </p>
                  </div>
                </div>
              </DetailPanelSection>

              <DetailPanelSection heading="Registration and exposure">
                <div className="grid gap-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-subtle)]">
                      Registration and key state
                    </p>
                    <dl className="mt-2 grid gap-3 text-sm text-[var(--color-text)]">
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-[var(--color-text-muted)]">
                          Public key state
                        </dt>
                        <dd>{selectedAgent.publicKeyState}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-[var(--color-text-muted)]">
                          Key fingerprint
                        </dt>
                        <dd className="font-mono text-xs">
                          {selectedAgent.keyFingerprint}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-subtle)]">
                      Operational exposure
                    </p>
                    <dl className="mt-2 grid gap-3 text-sm text-[var(--color-text)]">
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-[var(--color-text-muted)]">
                          Active leases
                        </dt>
                        <dd>{selectedAgent.activeLeases}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-[var(--color-text-muted)]">
                          Last activity
                        </dt>
                        <dd>{formatDateTime(selectedAgent.lastActivityAt)}</dd>
                      </div>
                      <div>
                        <dt className="text-[var(--color-text-muted)]">
                          Linked secrets
                        </dt>
                        <dd className="mt-2 flex flex-wrap gap-2">
                          {selectedAgent.linkedSecrets.map((secret) => (
                            <span
                              key={secret}
                              className="rounded-full bg-[var(--color-surface-subtle)] px-3 py-1 text-xs font-medium text-[var(--color-text)]"
                            >
                              {secret}
                            </span>
                          ))}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </DetailPanelSection>

              <DetailPanelSection heading="Actions">
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary">Rotate token</Button>
                  <Button variant="danger" onClick={() => setRevokeOpen(true)}>
                    Revoke agent
                  </Button>
                </div>
              </DetailPanelSection>
            </DetailPanel>
          ) : (
            <DetailPanel
              tone="agents"
              eyebrow="Selected agent"
              heading={
                <h2 className="text-lg font-semibold">No agent selected</h2>
              }
              description="Choose an agent from the inventory to inspect registration, lease exposure, and available actions."
              className="min-h-[680px]"
            />
          )}
        </div>
      </div>

      <Modal
        open={revokeOpen}
        title="Revoke agent access"
        confirmLabel="Confirm revoke"
        onClose={() => setRevokeOpen(false)}
        onConfirm={() => setRevokeOpen(false)}
      >
        <p className="text-sm text-[var(--color-text-muted)]">
          This mockup keeps destructive confirmation inside a modal. Final
          implementation should explain which leases and secrets are affected
          before revocation.
        </p>
      </Modal>
    </section>
  );
}
