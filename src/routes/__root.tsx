import { useDisconnect } from "@reown/appkit/react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useConnection } from "wagmi";
import idOSLogo from "@/assets/idOS-logo.svg?url";
import { ConnectWallet } from "@/components/connect-wallet";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export const Route = createRootRoute({
  component: RootLayout,
});

function Header() {
  const { disconnect } = useDisconnect();

  return (
    <header className="flex items-center justify-between border-border border-b p-5">
      <img alt="idOS Logo" height={32} src={idOSLogo} width={100} />
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

function RootLayout() {
  const { address, isConnected, isConnecting, isReconnecting } =
    useConnection();

  if (isReconnecting || isConnecting) {
    return (
      <div className="grid h-svh place-content-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!(isConnected && address)) {
    return <ConnectWallet />;
  }

  return (
    <div className="grid min-h-svh grid-rows-[auto_1fr] gap-4">
      <Header />
      <main className="min-w-0 p-5">
        <Outlet />
      </main>
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  );
}
