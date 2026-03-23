import { Badge, Button, Card, Input } from "../components/ui";

export function SettingsPage() {
  return (
    <section className="space-y-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-subtle)]">
          Settings
        </p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-[var(--color-text)]">
          Secondary controls stay useful without competing with daily work.
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--color-text-muted)]">
          Settings is intentionally quieter than the operational domains. This
          mockup keeps it flexible rather than freezing the information
          architecture too early.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card
          title="Session controls"
          description="Settings stay readable, but they do not displace operational work."
          actions={<Badge tone="neutral">Preview</Badge>}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Session timeout (minutes)"
              type="number"
              min={1}
              defaultValue={30}
            />
            <Input
              label="Auto-lock warning (seconds)"
              type="number"
              min={0}
              defaultValue={60}
            />
          </div>
          <div className="mt-4 flex gap-3">
            <Button>Save session defaults</Button>
            <Button variant="secondary">Reset</Button>
          </div>
        </Card>

        <Card
          title="Workspace density"
          description="Global density remains close to 6/10 even when exposed as a personal preference."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Default page size"
              type="number"
              min={10}
              max={100}
              defaultValue={25}
            />
            <Input
              label="Timeline batch size"
              type="number"
              min={10}
              max={200}
              defaultValue={40}
            />
          </div>
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">
            Density and table cadence are still treated as product-level
            defaults, not purely local taste.
          </p>
        </Card>

        <Card
          title="Security posture"
          description="Account security controls remain visible, but they stay secondary to Requests, Secrets, and Agents."
        >
          <div className="space-y-3 text-sm text-[var(--color-text)]">
            <div className="flex items-center justify-between rounded-[14px] bg-[var(--color-surface-subtle)] px-4 py-3">
              <span>TOTP MFA</span>
              <Badge tone="success">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between rounded-[14px] bg-[var(--color-surface-subtle)] px-4 py-3">
              <span>Device trust</span>
              <Badge tone="neutral">Review quarterly</Badge>
            </div>
          </div>
        </Card>

        <Card
          title="Environment"
          description="Read-only context can stay here without stealing focus from operations."
        >
          <div className="space-y-3 text-sm text-[var(--color-text)]">
            <div className="flex items-center justify-between rounded-[14px] bg-[var(--color-surface-subtle)] px-4 py-3">
              <span>Mode</span>
              <Badge tone="neutral">Mocked preview</Badge>
            </div>
            <div className="flex items-center justify-between rounded-[14px] bg-[var(--color-surface-subtle)] px-4 py-3">
              <span>Vault URL</span>
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                https://api-staging.agentpassvault.com
              </span>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
