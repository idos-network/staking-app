import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useEffect } from "react";
import { useChainId, useSwitchChain } from "wagmi";

import idOSLogo from "@/assets/idOS-logo.svg?url";
import { ConnectWallet } from "@/components/connect-wallet";
import { Button } from "@/components/ui/button";
import { APP_CHAIN_ID } from "@/lib/abi";

export const Route = createRootRoute({
  component: RootLayout,
});

function Header() {
  const { disconnect } = useDisconnect();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background p-5">
      <Link to="/">
        <img alt="idOS Logo" height={32} src={idOSLogo} width={100} />
      </Link>
      <Button
        onClick={() => {
          disconnect();
        }}
        size="lg"
      >
        Disconnect
      </Button>
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      className="border-b-2 border-transparent px-4 py-2 text-muted-foreground transition-colors hover:text-foreground data-[status=active]:border-primary data-[status=active]:text-foreground"
      to={to}
    >
      {children}
    </Link>
  );
}

function Navigation() {
  return (
    <nav className="flex gap-6 border-b border-border">
      <NavLink to="/staking">Staking</NavLink>
      <NavLink to="/claiming">Claiming</NavLink>
    </nav>
  );
}

function useChainAutoSwitch() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (chainId !== APP_CHAIN_ID) {
      switchChain({ chainId: APP_CHAIN_ID });
    }
  }, [chainId, switchChain]);
}

function RootLayout() {
  const { isConnected, status } = useAppKitAccount();
  useChainAutoSwitch();

  if (status === "reconnecting" || status === "connecting") {
    return null;
  }

  if (!isConnected) {
    return <ConnectWallet />;
  }

  return (
    <div className="grid min-h-svh grid-rows-[auto_1fr] gap-4">
      <Header />
      <div className="min-w-0 p-5">
        <div className="mx-auto flex w-full max-w-[678px] min-w-0 flex-col gap-10">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl">idOS Portal</h2>
              <p className="text-muted-foreground">
                Manage your IDOS positions — stake tokens to secure the network
                and claim your vested allocation.
              </p>
            </div>
            <Navigation />
          </div>
          <main>
            <Outlet />
          </main>
        </div>
      </div>
      <TanStackDevtools
        plugins={[
          { name: "TanStack Router", render: <TanStackRouterDevtoolsPanel /> },
          { name: "TanStack Query", render: <ReactQueryDevtoolsPanel /> },
        ]}
      />
    </div>
  );
}
