import { useDisconnect } from "@reown/appkit/react";
import { useConnection } from "wagmi";
import idOSLogo from "@/assets/idOS-logo.svg?url";
import { ConnectWallet } from "@/components/connect-wallet";
import { Staking } from "@/components/staking/staking";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function App() {
  const { address, isConnected, isConnecting, isReconnecting } =
    useConnection();
  const { disconnect } = useDisconnect();

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
      <main className="min-w-0 p-5">
        <div className="mx-auto flex w-full min-w-0 max-w-[678px] flex-col gap-10">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl">IDOS Staking</h2>
            <p className="text-muted-foreground">
              Stake your IDOS tokens to secure the network and receive Staking
              Rewards.
            </p>
          </div>
          <Staking />
        </div>
      </main>
    </div>
  );
}

export default App;
