import { ChevronRightIcon } from "lucide-react";
import horizenIcon from "@/assets/horizen-labs-logo.svg?url";
import idOSIcon from "@/assets/idOS-icon.svg?url";
import idOSTokenIcon from "@/assets/idOS-token.svg?url";
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

export const nodeProviders: NodeProvider[] = [
  {
    name: "idOS",
    address: "0x0C5393db793DbA88f16DC4D030D678FBD88F8B0D",
    assets: "IDOS",
    assetIcon: (
      <div className="flex size-12 items-center justify-center rounded-full">
        <img
          alt="idOS Token Icon"
          className="rounded-full"
          height={32}
          src={idOSTokenIcon}
          width={32}
        />
      </div>
    ),
    providerIcon: <img alt="idOS Icon" height={36} src={idOSIcon} width={36} />,
  },
  {
    name: "Horizen Labs",
    address: "0x5A20FEdA3120A944b6a18BB80DB78776908f282f",
    assets: "IDOS",
    assetIcon: (
      <div className="flex size-12 items-center justify-center rounded-full">
        <img
          alt="idOS Token Icon"
          className="rounded-full"
          height={32}
          src={idOSTokenIcon}
          width={32}
        />
      </div>
    ),
    providerIcon: (
      <img alt="Horizen Labs Icon" height={30} src={horizenIcon} width={30} />
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
