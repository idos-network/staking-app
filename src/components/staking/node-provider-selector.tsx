import { TokenETH, TokenNEAR, TokenXRP, TokenXTZ } from "@web3icons/react";
import type { ReactNode } from "react";
import idOSIcon from "@/assets/idOS-icon.svg?url";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type NodeProvider = {
  name: string;
  address: `0x${string}`;
  apy: number;
  assets: string;
  expectedIdos: string;
  assetIcon: React.ReactElement;
  providerIcon: React.ReactElement;
};

export const nodeProviders: NodeProvider[] = [
  {
    name: "idOS Node",
    address: "0x4Bfcc302AA00c8f9bD04eBfBbd8C28762285292a",
    apy: 10,
    assets: "ETH",
    expectedIdos: "206.25 IDOS",
    assetIcon: (
      <div className="flex size-5 items-center justify-center rounded-full bg-[#2c5ff6]">
        <TokenETH className="size-4" />
      </div>
    ),
    providerIcon: <img alt="idOS Icon" height={36} src={idOSIcon} width={36} />,
  },
  {
    name: "Near Node",
    address: "0x1dafeB42aD85ECc7EBF80410d3a3F5ADA06d153A",
    apy: 10,
    assets: "NEAR",
    expectedIdos: "206.25 IDOS",
    assetIcon: (
      <div className="flex size-5 items-center justify-center rounded-full bg-green-300">
        <TokenNEAR className="size-4" color="black" variant="mono" />
      </div>
    ),
    providerIcon: (
      <div className="flex size-8 items-center justify-center rounded-full bg-green-300">
        <TokenNEAR className="size-6" color="black" variant="mono" />
      </div>
    ),
  },
  {
    name: "Ripple Node",
    address: "0x8Da270863C2fD726c28eCeB4C2763d0746e63920",
    apy: 10,
    assets: "XRP",
    expectedIdos: "206.25 IDOS",
    assetIcon: (
      <div className="flex size-5 items-center justify-center rounded-full bg-white">
        <TokenXRP className="size-4" color="black" variant="mono" />
      </div>
    ),
    providerIcon: (
      <div className="flex size-8 items-center justify-center rounded-full bg-white">
        <TokenXRP className="size-6" color="black" variant="mono" />
      </div>
    ),
  },
  {
    name: "Tezos Node",
    address: "0x4DE22ae3e2AD8CE21d878c104C2bc9bE4f8529BB",
    apy: 10,
    assets: "TEZ",
    expectedIdos: "206.25 IDOS",
    assetIcon: (
      <div className="flex size-5 items-center justify-center rounded-full bg-[#2c5ff6]">
        <TokenXTZ className="size-4" color="white" variant="mono" />
      </div>
    ),
    providerIcon: (
      <div className="flex size-8 items-center justify-center rounded-full bg-[#2c5ff6]">
        <TokenXTZ className="size-6" color="white" variant="mono" />
      </div>
    ),
  },
];

function NodeProviderButton({
  provider,
  onClick,
  isSelected,
}: {
  provider: NodeProvider;
  onClick: () => void;
  isSelected: boolean;
}) {
  return (
    <Button
      aria-selected={isSelected}
      className={cn(
        "flex flex-col items-start gap-10 border p-6 text-xl hover:border-success",
        isSelected ? "border-success" : "border-transparent"
      )}
      data-selected={isSelected}
      onClick={onClick}
      role="option"
      variant="secondary"
    >
      <div className="flex flex-col gap-4 self-stretch">
        <div className="flex items-center gap-3.5">
          {provider.providerIcon}
          {provider.name}
        </div>
        <Badge className="w-fit" size="lg" variant="success">
          {provider.apy}% APY
        </Badge>
      </div>
      <div className="flex items-center justify-between gap-2 self-stretch">
        <div className="flex flex-1 flex-col items-start gap-2">
          <span className="text-muted-foreground text-sm">Assets</span>
          <div className="flex items-center gap-2 text-sm">
            {provider.assetIcon} {provider.assets}
          </div>
        </div>
        <div className="flex flex-1 flex-col items-start gap-2">
          <span className="text-muted-foreground text-sm">Expected IDOS</span>
          <span className="text-sm">{provider.expectedIdos}</span>
        </div>
      </div>
    </Button>
  );
}

type NodeProviderSelectorProps = {
  providers: NodeProvider[];
  selectedProvider: NodeProvider;
  onProviderChange: (provider: NodeProvider) => void;
  trigger: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function NodeProviderSelector({
  providers,
  selectedProvider,
  onProviderChange,
  trigger,
  open,
  onOpenChange,
}: NodeProviderSelectorProps) {
  const handleProviderSelect = (provider: NodeProvider) => {
    onProviderChange(provider);
    onOpenChange?.(false);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="font-semibold">Node Provider</p>
      <Dialog onOpenChange={onOpenChange} open={open}>
        {trigger}
        <DialogPopup className="gap-6 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Choose a Node Provider</DialogTitle>
          </DialogHeader>
          <DialogPanel
            className="grid grid-cols-1 gap-5 sm:grid-cols-2"
            role="listbox"
          >
            {providers.map((provider) => (
              <DialogClose
                key={provider.name}
                render={
                  <NodeProviderButton
                    isSelected={selectedProvider.name === provider.name}
                    key={provider.name}
                    onClick={() => {
                      handleProviderSelect(provider);
                    }}
                    provider={provider}
                  />
                }
              />
            ))}
          </DialogPanel>
        </DialogPopup>
      </Dialog>
    </div>
  );
}
