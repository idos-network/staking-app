import { useAppKitAccount } from "@reown/appkit/react";
import { useReadContract } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  formatEthereumAddress,
  formatTokenAmount,
  fromWei,
} from "@/lib/format";
import { balanceOfParams } from "@/lib/queries/query-options";
import type { NodeProvider } from "./node-provider-selector";

type ConfirmStakeProps = {
  amount: number;
  isValid: boolean;
  pending: boolean;
  provider: NodeProvider;
};

export function ConfirmStake({
  amount,
  isValid,
  pending,
  provider,
}: ConfirmStakeProps) {
  const { address } = useAppKitAccount();

  // Fetch balance
  const balanceParams = balanceOfParams(address as `0x${string}`);
  const { data: balance, isFetching: isBalanceFetching } = useReadContract({
    ...balanceParams,
    query: {
      refetchOnMount: "always",
    },
  });

  // Calculate values
  const availableBalance = fromWei(balance);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            className="w-full lg:w-2xs"
            disabled={!isValid || pending}
            size="lg"
            type="button"
          >
            {pending ? <Spinner className="size-5" /> : "Confirm"}
          </Button>
        }
      />
      <DialogPopup className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Stake</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-stretch gap-5 p-6">
          <div className="rounded-[20px] bg-secondary px-4 py-2">
            <ul className="flex flex-col gap-2">
              <li className="flex h-10 items-center justify-between gap-2">
                <span className="text-muted-foreground text-sm">Address</span>
                <span>{formatEthereumAddress(address)}</span>
              </li>
              <li className="flex h-10 items-center justify-between gap-2">
                <span className="text-muted-foreground text-sm">
                  Node Provider
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <span className="flex size-[30px] items-center justify-center [&>img]:max-h-[30px] [&>img]:max-w-[30px]">
                    {provider.providerIcon}
                  </span>
                  {provider.name}
                </span>
              </li>
              <li className="flex h-8 items-center justify-between gap-2">
                <span className="text-muted-foreground text-sm">
                  Available Balance
                </span>
                <span>
                  {isBalanceFetching ? (
                    <Skeleton className="h-4 w-20" />
                  ) : (
                    `${formatTokenAmount(availableBalance)} IDOS`
                  )}
                </span>
              </li>
              <li className="flex h-8 items-center justify-between gap-2">
                <span className="text-muted-foreground text-sm">
                  Amount to Stake
                </span>
                <span>{formatTokenAmount(amount)} IDOS</span>
              </li>
            </ul>
          </div>
          <p className="text-muted-foreground text-sm">
            You'll be asked to sign two transactions: an allowance for IDOS, and
            the staking transaction
          </p>
        </div>

        <DialogFooter className="border-none bg-popover pt-2 pb-6">
          <DialogClose
            render={
              <Button className="w-full" form="stake" size="lg" type="submit">
                Confirm
              </Button>
            }
          />
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
