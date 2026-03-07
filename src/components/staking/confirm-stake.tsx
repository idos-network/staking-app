import { useAppKitAccount } from "@reown/appkit/react";
import { parseUnits } from "viem";
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
import { IDOS_NODE_STAKING_ABI_ADDRESS } from "@/lib/abi";
import {
  formatEthereumAddress,
  formatTokenAmount,
  fromWei,
} from "@/lib/format";
import { allowanceParams, balanceOfParams } from "@/lib/queries/query-options";

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
  const amountInWei = parseUnits(amount.toString(), 18);
  const allowanceQuery = allowanceParams(
    address as `0x${string}` | undefined,
    IDOS_NODE_STAKING_ABI_ADDRESS,
  );
  const { data: allowance, isFetching: isAllowanceFetching } = useReadContract({
    ...allowanceQuery,
    query: {
      refetchOnMount: "always",
    },
  });

  // Calculate values
  const availableBalance = fromWei(balance);
  const requiresApproval = (allowance ?? 0n) < amountInWei;
  let transactionMessage =
    "Your current IDOS allowance already covers this amount, so you'll only be asked to sign the staking transaction";

  if (isAllowanceFetching) {
    transactionMessage =
      "Checking your current IDOS allowance before preparing the transaction";
  } else if (requiresApproval) {
    transactionMessage =
      "You'll be asked to sign two transactions only if needed: an IDOS approval and then the staking transaction";
  }

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
                <span className="text-sm text-muted-foreground">Address</span>
                <span>{formatEthereumAddress(address)}</span>
              </li>
              <li className="flex h-10 items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">
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
                <span className="text-sm text-muted-foreground">
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
                <span className="text-sm text-muted-foreground">
                  Amount to Stake
                </span>
                <span>{formatTokenAmount(amount)} IDOS</span>
              </li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">{transactionMessage}</p>
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
