import { TokenETH, TokenZEN } from "@web3icons/react";
import { ChevronRightIcon } from "lucide-react";
import idOSIcon from "@/assets/idOS-icon.svg?url";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type NodeProvider = {
  name: string;
  address: `0x${string}`;
  assets: string;
  assetIcon: React.ReactElement;
  providerIcon: React.ReactElement;
};

// TODO: update node provider addresses for mainnet before production deployment
export const nodeProviders: NodeProvider[] = [
  {
    name: "idOS Node",
    address: "0x4Bfcc302AA00c8f9bD04eBfBbd8C28762285292a",
    assets: "ETH",
    assetIcon: (
      <div className="flex size-5 items-center justify-center rounded-full bg-[#2c5ff6]">
        <TokenETH className="size-4" />
      </div>
    ),
    providerIcon: <img alt="idOS Icon" height={36} src={idOSIcon} width={36} />,
  },
  {
    // TODO: update Horizen node provider address before production deployment
    name: "Horizen Node",
    address: "0x2222222222222222222222222222222222222222",
    assets: "ZEN",
    assetIcon: (
      <div className="flex size-5 items-center justify-center rounded-full bg-[#041742]">
        <TokenZEN className="size-4" />
      </div>
    ),
    providerIcon: (
      <div className="flex size-8 items-center justify-center rounded-full bg-[#041742]">
        <TokenZEN className="size-6" />
      </div>
    ),
  },
];

export function getRandomProvider(): NodeProvider {
  return nodeProviders[Math.floor(Math.random() * nodeProviders.length)];
}

type NodeProviderTriggerProps = {
  provider: NodeProvider;
};
function NodeProviderTrigger({ provider, ...props }: NodeProviderTriggerProps) {
  return (
    <Button
      className="h-14 w-full justify-between rounded-xl px-4 text-xl"
      variant="secondary"
      {...props}
    >
      <span className="flex items-center gap-3">
        <div>{provider.providerIcon}</div>
        <span>{provider.name}</span>
      </span>
      <span className="flex items-center gap-5">
        <ChevronRightIcon className="size-6" />
      </span>
    </Button>
  );
}

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
      </div>
      <div className="flex items-center justify-between gap-2 self-stretch">
        <div className="flex flex-1 flex-col items-start gap-2">
          <span className="text-muted-foreground text-sm">Assets</span>
          <div className="flex items-center gap-2 text-sm">
            {provider.assetIcon} {provider.assets}
          </div>
        </div>
      </div>
    </Button>
  );
}

type NodeProviderSelectorProps = {
  providers: NodeProvider[];
  selectedProvider: NodeProvider;
  onProviderChange: (provider: NodeProvider) => void;
};
export function NodeProviderSelector({
  providers,
  selectedProvider,
  onProviderChange,
}: NodeProviderSelectorProps) {
  const handleProviderSelect = (provider: NodeProvider) => {
    onProviderChange(provider);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="font-semibold">Node Provider</p>
      <Dialog>
        <DialogTrigger
          render={<NodeProviderTrigger provider={selectedProvider} />}
        />
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
