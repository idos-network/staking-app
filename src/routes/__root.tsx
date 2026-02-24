import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import idOSLogo from "@/assets/idOS-logo.svg?url";
import { ConnectWallet } from "@/components/connect-wallet";
import { Button } from "@/components/ui/button";

export const Route = createRootRoute({
  component: RootLayout,
});

function Header() {
  const { disconnect } = useDisconnect();

  return (
    <header className="flex items-center justify-between border-border border-b p-5">
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
      className="border-transparent border-b-2 px-4 pb-2 text-muted-foreground transition-colors hover:text-foreground data-[status=active]:border-primary data-[status=active]:text-foreground"
      to={to}
    >
      {children}
    </Link>
  );
}

function Navigation() {
  return (
    <nav className="flex gap-6 border-border border-b">
      <NavLink to="/staking">Staking</NavLink>
      <NavLink to="/claiming">Claiming</NavLink>
    </nav>
  );
}

function RootLayout() {
  const { isConnected, status } = useAppKitAccount();

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
        <div className="mx-auto flex w-full min-w-0 max-w-[678px] flex-col gap-10">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl">IDOS Earn</h2>
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
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  );
}
