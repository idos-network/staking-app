import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  formatEthereumAddress,
  formatTokenAmount,
  fromWei,
} from "@/lib/format";

type ConfirmClaimVestingProps = {
  onConfirm: () => void;
  isPending: boolean;
  address: string | undefined;
  claimableNow: bigint;
};

export function ConfirmClaimVesting({
  onConfirm,
  isPending,
  address,
  claimableNow,
}: ConfirmClaimVestingProps) {
  const [agreed, setAgreed] = useState(false);
  const claimableDisplay = fromWei(claimableNow);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            className="w-full sm:w-2xs"
            disabled={claimableNow === 0n || isPending}
            size="lg"
          >
            {isPending ? <Spinner className="size-5" /> : "Claim now"}
          </Button>
        }
      />
      <DialogPopup className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Claim Vested Tokens</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-stretch gap-5 p-6">
          <div className="rounded-[20px] bg-secondary px-4 py-2">
            <ul className="flex flex-col gap-2">
              <li className="flex h-8 items-center justify-between gap-2">
                <span className="text-muted-foreground text-sm">Recipient</span>
                <span className="font-mono text-sm">
                  {formatEthereumAddress(address)}
                </span>
              </li>
              <li className="flex h-8 items-center justify-between gap-2">
                <span className="text-muted-foreground text-sm">
                  Amount to Claim
                </span>
                <span>{formatTokenAmount(claimableDisplay)} IDOS</span>
              </li>
            </ul>
          </div>
          <p className="text-muted-foreground text-sm">
            You will be asked to sign a transaction to claim your vested tokens.
            Gas fees apply.
          </p>
          <Label className="cursor-pointer items-center">
            <Checkbox
              checked={agreed}
              className="mt-0.5"
              onCheckedChange={(val) => setAgreed(val)}
            />
            <span>
              I agree with the{" "}
              <a
                className="underline transition-colors hover:text-foreground"
                href="https://idos.network"
                rel="noopener noreferrer"
                target="_blank"
              >
                Claim Terms & Conditions
              </a>
            </span>
          </Label>
        </div>
        <DialogFooter className="border-none bg-popover pt-2 pb-6">
          <DialogClose
            render={
              <Button
                className="w-full"
                disabled={!agreed}
                onClick={onConfirm}
                size="lg"
              >
                Confirm Claim
              </Button>
            }
          />
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
