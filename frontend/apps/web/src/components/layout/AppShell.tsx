import type { ReactNode } from "react";
import {
  Bot,
  FlaskConical,
  History,
  KeyRound,
  Lock,
  LogOut,
  Settings,
  Shield,
  Vault,
} from "lucide-react";
import { Button } from "../ui";

interface NavItem {
  key: string;
  label: string;
  path: string;
}

interface AppShellProps {
  children: ReactNode;
  adminName: string;
  currentPath: string;
  navItems: NavItem[];
  onNavigate: (path: string) => void;
  onLockVault: () => void;
  onLogout: () => void;
}

function navIconFor(key: string) {
  if (key === "requests") {
    return <Shield className="h-4 w-4" />;
  }

  if (key === "secrets") {
    return <Vault className="h-4 w-4" />;
  }

  if (key === "agents") {
    return <Bot className="h-4 w-4" />;
  }

  if (key === "audit-log") {
    return <History className="h-4 w-4" />;
  }

  if (key === "settings") {
    return <Settings className="h-4 w-4" />;
  }

  if (key === "ui-lab") {
    return <FlaskConical className="h-4 w-4" />;
  }

  return <KeyRound className="h-4 w-4" />;
}

function activeNavClass(key: string) {
  if (key === "requests") {
    return "border-[var(--color-domain-requests-border)] bg-[var(--color-domain-requests-soft)] text-[var(--color-domain-requests-text)]";
  }

  if (key === "secrets") {
    return "border-[var(--color-domain-secrets-border)] bg-[var(--color-domain-secrets-soft)] text-[var(--color-domain-secrets-text)]";
  }

  if (key === "agents") {
    return "border-[var(--color-domain-agents-border)] bg-[var(--color-domain-agents-soft)] text-[var(--color-domain-agents-text)]";
  }

  return "border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)] text-[var(--color-text)]";
}

export function AppShell({
  children,
  adminName,
  currentPath,
  navItems,
  onNavigate,
  onLockVault,
  onLogout,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-app-bg)] text-[var(--color-text)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-5 px-5 py-5">
        <aside className="flex w-[280px] shrink-0 flex-col rounded-[24px] border border-[var(--color-border)] bg-[var(--color-shell)] p-4 shadow-[var(--color-shadow)]">
          <div className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-subtle)]">
              AgentPassVault
            </p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[var(--color-text)]">
              Operations Console
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Lo-fi mockup aligned to the UX guide and pattern rules.
            </p>
          </div>

          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                    isActive
                      ? `border ${activeNavClass(item.key)}`
                      : "border border-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {navIconFor(item.key)}
                  <span className="flex-1">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-subtle)]">
              Current session
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
              {adminName}
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Human review remains the action boundary for request handling and
              lease issuance.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="flex items-center justify-between rounded-[24px] border border-[var(--color-border)] bg-[var(--color-shell)] px-6 py-4 shadow-[var(--color-shadow)]">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-subtle)]">
                Signed in
              </p>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {adminName}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                startIcon={<Lock className="h-4 w-4" />}
                onClick={onLockVault}
              >
                Lock Vault
              </Button>
              <Button
                variant="secondary"
                startIcon={<LogOut className="h-4 w-4" />}
                onClick={onLogout}
              >
                Logout
              </Button>
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
