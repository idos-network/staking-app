import { useAppKit } from "@reown/appkit/react";
import idOSLogo from "@/assets/idOS-logo.svg?url";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardPanel } from "@/components/ui/card";

export function ConnectWallet() {
  const { open } = useAppKit();

  return (
    <div className="flex h-svh flex-col place-content-center items-center p-5">
      <Card className="w-full max-w-sm">
        <CardPanel className="flex h-full flex-col items-center justify-center gap-6">
          <img alt="idOS Logo" height={32} src={idOSLogo} width={100} />
          <h2 className="font-semibold text-2xl">Earn with idOS</h2>
          <p className="text-center text-muted-foreground text-sm">
            Manage your idOS positions — stake tokens to secure the network and
            claim your vested allocation.
          </p>
        </CardPanel>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => {
              open();
            }}
            size="lg"
          >
            Connect an EVM wallet
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
