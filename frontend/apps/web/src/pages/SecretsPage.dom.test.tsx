import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { SecretsPage } from "./SecretsPage";

vi.mock("../config/env", () => ({
  readAppEnv: () => ({
    apiUrl: "https://localhost:5173",
    configuredApiUrl: null,
    apiMockingEnabled: true,
    apiClientFallbackEnabled: false,
    apiProxyEnabled: false,
    erudaEnabled: false,
  }),
}));

describe("SecretsPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the lo-fi secret catalog and detail panel", async () => {
    render(
      <SecretsPage
        isVaultLocked={false}
        masterKeys={{} as never}
        onOpenSecret={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Inspect protected assets without losing operational context.",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("AWS Deploy Key")).toHaveLength(2);
    expect(screen.getByText("Value preview")).toBeInTheDocument();
  });

  it("blocks quick reveal when the vault is locked", async () => {
    render(
      <SecretsPage
        isVaultLocked={true}
        masterKeys={null}
        onOpenSecret={vi.fn()}
      />,
    );

    await userEvent.click(screen.getAllByRole("button", { name: "Reveal" })[0]);

    expect(
      screen.getByText(
        "Vault is locked. Unlock before revealing secret values.",
      ),
    ).toBeInTheDocument();
  });

  it("reveals the secret value inline when unlocked", async () => {
    render(
      <SecretsPage
        isVaultLocked={false}
        masterKeys={{} as never}
        onOpenSecret={vi.fn()}
      />,
    );

    await userEvent.click(screen.getAllByRole("button", { name: "Reveal" })[0]);

    expect(screen.getAllByText(/AKIA\.\.\.F5M0/)).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "Hide value" }),
    ).toBeInTheDocument();
  });
});
