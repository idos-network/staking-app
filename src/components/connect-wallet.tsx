import { useAppKit } from "@reown/appkit/react";
import { Button } from "@/components/ui/button";

export function ConnectWallet() {
  const { open } = useAppKit();

  return (
    <div className="flex h-svh flex-col place-content-center items-center gap-4 p-5">
      <h2 className="text-center font-semibold text-3xl">IDOS Staking</h2>
      <p className="text-center text-muted-foreground">
        Stake your IDOS tokens to secure the network and receive Staking
        Rewards.
      </p>
      <Button
        className="w-fit"
        onClick={() => {
          open();
        }}
      >
        Connect an EVM wallet
      </Button>
    </div>
  );
}
